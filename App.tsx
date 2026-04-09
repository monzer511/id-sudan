import React, { useState, useEffect } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { DigitalCard } from './components/DigitalCard';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { UserData, AppStep, DocumentFiles, DocumentPreviews, VerificationResult, VerificationLog } from './types';
import { verifyIdentityWithGemini, fileToGenerativePart } from './services/geminiService';
import { Upload, CheckCircle, AlertTriangle, Printer, ArrowRight, ArrowLeft, Loader2, Fingerprint, Camera, FileText, Download, Home, Lock, Shield } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, getDocFromServer, doc } from 'firebase/firestore';

const initialUserData: UserData = {
  firstName: '',
  secondName: '',
  thirdName: '',
  fourthName: '',
  nationalId: '',
  birthDate: '',
  birthPlace: 'Sudan',
  bloodType: 'O+',
  jobTitle: '',
  address: '',
};

export default function App() {
  // Set initial step to LANDING_PAGE
  const [currentStep, setCurrentStep] = useState<number>(AppStep.LANDING_PAGE);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [files, setFiles] = useState<DocumentFiles>({ passport: null, selfie: null });
  const [previews, setPreviews] = useState<DocumentPreviews>({ passport: null, selfie: null });
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMsg("فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'selfie') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [type]: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startVerification = async () => {
    if (!files.passport || !files.selfie) {
      setErrorMsg("يرجى رفع كل من الصورة الشخصية وصورة الجواز");
      return;
    }

    setCurrentStep(AppStep.AI_VERIFICATION);
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const passportBase64 = await fileToGenerativePart(files.passport);
      const selfieBase64 = await fileToGenerativePart(files.selfie);

      const result = await verifyIdentityWithGemini(userData, passportBase64, selfieBase64);
      
      const fullName = `${userData.firstName} ${userData.secondName} ${userData.thirdName} ${userData.fourthName}`.trim();

      // Save to MySQL via API
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: Math.random().toString(36).substr(2, 9),
            nationalId: userData.nationalId,
            fullName: fullName,
            status: result.verified ? 'APPROVED' : 'REJECTED',
            confidence: result.confidence,
            userData: { ...userData },
            photoUrl: previews.selfie,
            uid: auth.currentUser?.uid || null
          })
        });
      } catch (dbError) {
        console.error("Error saving log to MySQL:", dbError);
      }

      setVerificationResult(result);
      setIsVerifying(false);
    } catch (error) {
      console.error(error);
      setIsVerifying(false);
      setErrorMsg("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }
  };

  const nextStep = () => {
    if (currentStep === AppStep.DATA_ENTRY) {
      if (!userData.firstName || !userData.secondName || !userData.thirdName || !userData.fourthName || !userData.nationalId || !userData.birthDate) {
         setErrorMsg("يرجى تعبئة الحقول الأساسية");
         return;
      }
    }
    setErrorMsg(null);
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setErrorMsg(null);
  };

  const handleDownload = () => {
    // Change page title temporarily for better PDF filename
    const originalTitle = document.title;
    document.title = `IDS_${userData.nationalId}`;
    window.print();
    // Restore title after print dialog closes
    document.title = originalTitle;
  };

  const handleReset = () => {
    setUserData(initialUserData);
    setFiles({ passport: null, selfie: null });
    setPreviews({ passport: null, selfie: null });
    setVerificationResult(null);
    setCurrentStep(AppStep.LANDING_PAGE);
  };

  const toggleAdmin = () => {
    if (currentStep === AppStep.ADMIN_LOGIN || currentStep === AppStep.ADMIN_DASHBOARD) {
      setCurrentStep(AppStep.WELCOME);
    } else {
      setCurrentStep(AppStep.ADMIN_LOGIN);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await auth.signOut();
      setIsAdminLoggedIn(false);
      setCurrentStep(AppStep.WELCOME);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // If on Landing Page, render only the Landing Component
  if (currentStep === AppStep.LANDING_PAGE) {
    return <LandingPage onStart={() => setCurrentStep(AppStep.WELCOME)} />;
  }

  // Otherwise render the Main App Layout
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep(AppStep.LANDING_PAGE)}>
            <div className="w-8 h-8 bg-sudan-green rounded-lg flex items-center justify-center text-white">
              <Fingerprint size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">الهوية الرقمية السودانية</h1>
          </div>
          <button 
            onClick={toggleAdmin}
            className="text-gray-400 hover:text-sudan-green transition-colors"
            title="تسجيل دخول مسؤول"
          >
            {currentStep === AppStep.ADMIN_DASHBOARD ? <Shield size={20} /> : <Lock size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pb-12 print:max-w-none print:pb-0 print:w-full print:h-full print:flex print:items-center print:justify-center">
        
        {/* Step Indicator - Hide if in Admin Mode */}
        {currentStep < 100 && (
           <StepIndicator currentStep={currentStep} />
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mx-4 overflow-hidden min-h-[500px] relative transition-all duration-300 print:shadow-none print:border-none print:m-0 print:min-h-0 print:w-full">
          
          {/* Admin Dashboard / Login */}
          {(currentStep === AppStep.ADMIN_LOGIN || currentStep === AppStep.ADMIN_DASHBOARD) && (
            <AdminDashboard 
              isLoggedIn={isAdminLoggedIn} 
              setIsLoggedIn={setIsAdminLoggedIn}
              onLogout={handleAdminLogout}
            />
          )}

          {/* Error Message */}
          {errorMsg && currentStep < 100 && (
            <div className="bg-red-50 border-r-4 border-sudan-red p-4 m-4 mb-0 rounded-md flex items-center gap-3">
              <AlertTriangle className="text-sudan-red flex-shrink-0" />
              <p className="text-sudan-red text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Step 1: Welcome (App Start) */}
          {currentStep === AppStep.WELCOME && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 py-16">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-sudan-red to-sudan-green rounded-full blur opacity-25"></div>
                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center border shadow-sm">
                  <Fingerprint className="text-sudan-green w-12 h-12" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">مرحباً بك في نظام الهوية الموحد</h2>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  احصل على هويتك الرقمية المعتمدة في 6 خطوات بسيطة باستخدام الذكاء الاصطناعي للمطابقة والتحقق الفوري.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg mt-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-2">
                    <FileText className="text-sudan-green mb-1" />
                    <span className="text-sm font-semibold">ادخال البيانات</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-2">
                    <Camera className="text-sudan-green mb-1" />
                    <span className="text-sm font-semibold">تصوير المستندات</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-2">
                    <CheckCircle className="text-sudan-green mb-1" />
                    <span className="text-sm font-semibold">تحقق ذكي</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (!user) {
                    handleLogin().then(() => nextStep());
                  } else {
                    nextStep();
                  }
                }}
                className="mt-8 bg-sudan-green hover:bg-green-800 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2 text-lg"
              >
                {user ? 'بدء الإجراءات' : 'سجل دخول للمتابعة'}
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Data Entry */}
          {currentStep === AppStep.DATA_ENTRY && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b pb-4">
                <FileText className="text-sudan-green" />
                البيانات الشخصية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">الاسم الأول</label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="مثال: محمد"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">الاسم الثاني</label>
                  <input
                    type="text"
                    name="secondName"
                    value={userData.secondName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="مثال: أحمد"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">الاسم الثالث</label>
                  <input
                    type="text"
                    name="thirdName"
                    value={userData.thirdName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="مثال: علي"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">الاسم الرابع (اللقب)</label>
                  <input
                    type="text"
                    name="fourthName"
                    value={userData.fourthName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="مثال: عثمان"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">الرقم الوطني (11 خانة)</label>
                  <input
                    type="number"
                    name="nationalId"
                    value={userData.nationalId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="مثال: 111-222-333-44"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">تاريخ الميلاد</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={userData.birthDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">فصيلة الدم</label>
                  <select
                    name="bloodType"
                    value={userData.bloodType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">المهنة</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={userData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="مثال: مهندس برمجيات"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">العنوان (الولاية - المدينة)</label>
                  <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="مثال: الخرطوم - بحري"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2">
                  <ArrowRight size={18} />
                  السابق
                </button>
                <button onClick={nextStep} className="bg-sudan-green hover:bg-green-800 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2">
                  التالي
                  <ArrowLeft size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Document Upload */}
          {currentStep === AppStep.DOCUMENT_UPLOAD && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b pb-4">
                <Camera className="text-sudan-green" />
                رفع المستندات
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Selfie Upload */}
                <div className="space-y-4">
                   <div className="font-semibold text-gray-700">الصورة الشخصية (حديثة)</div>
                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative h-64 flex flex-col items-center justify-center">
                      {previews.selfie ? (
                        <div className="relative w-full h-full">
                             <img src={previews.selfie} alt="Selfie" className="w-full h-full object-contain rounded-md" />
                             <button onClick={() => { setFiles(p => ({...p, selfie: null})); setPreviews(p => ({...p, selfie: null})); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600">
                                <span className="sr-only">Delete</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                        </div>
                      ) : (
                        <>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(e, 'selfie')} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                             <Upload className="text-blue-500 w-8 h-8" />
                          </div>
                          <p className="text-sm text-gray-500">اضغط لرفع الصورة الشخصية</p>
                          <p className="text-xs text-gray-400 mt-2">JPG, PNG (Max 5MB)</p>
                        </>
                      )}
                   </div>
                </div>

                {/* Passport Upload */}
                <div className="space-y-4">
                   <div className="font-semibold text-gray-700">صورة جواز السفر</div>
                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative h-64 flex flex-col items-center justify-center">
                      {previews.passport ? (
                         <div className="relative w-full h-full">
                            <img src={previews.passport} alt="Passport" className="w-full h-full object-contain rounded-md" />
                            <button onClick={() => { setFiles(p => ({...p, passport: null})); setPreviews(p => ({...p, passport: null})); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600">
                                <span className="sr-only">Delete</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                         </div>
                      ) : (
                        <>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(e, 'passport')} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                             <Upload className="text-sudan-green w-8 h-8" />
                          </div>
                          <p className="text-sm text-gray-500">اضغط لرفع صورة الجواز</p>
                          <p className="text-xs text-gray-400 mt-2">JPG, PNG (Max 5MB)</p>
                        </>
                      )}
                   </div>
                </div>
              </div>
              <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2">
                  <ArrowRight size={18} />
                  السابق
                </button>
                <button 
                  onClick={startVerification} 
                  className={`bg-sudan-green hover:bg-green-800 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 ${(files.passport && files.selfie) ? '' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={!files.passport || !files.selfie}
                >
                  التحقق الذكي
                  <CheckCircle size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: AI Verification */}
          {currentStep === AppStep.AI_VERIFICATION && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-8">
              {isVerifying ? (
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-sudan-green rounded-full border-t-transparent animate-spin"></div>
                    <Loader2 className="absolute inset-0 m-auto text-sudan-green w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">جاري المطابقة بالذكاء الاصطناعي...</h3>
                  <div className="space-y-2 text-sm text-gray-500 max-w-sm mx-auto">
                    <p className="flex items-center gap-2 justify-center"><CheckCircle size={14} className="text-green-500" /> تحليل صورة الجواز</p>
                    <p className="flex items-center gap-2 justify-center"><CheckCircle size={14} className="text-green-500" /> مطابقة الملامح الحيوية</p>
                    <p className="flex items-center gap-2 justify-center"><CheckCircle size={14} className="text-green-500" /> التأكد من صحة البيانات</p>
                  </div>
                </div>
              ) : verificationResult ? (
                <div className="text-center space-y-6 max-w-md w-full animate-fade-in-up">
                  {verificationResult.verified ? (
                     <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <CheckCircle className="text-green-600 w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">تم التحقق بنجاح!</h3>
                        <p className="text-green-700 text-sm mb-4">{verificationResult.reason}</p>
                        <div className="w-full bg-green-200 rounded-full h-2.5 mb-1">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${verificationResult.confidence}%` }}></div>
                        </div>
                        <p className="text-xs text-green-600 font-bold mb-6">نسبة التطابق: {verificationResult.confidence}%</p>
                        
                        <button onClick={nextStep} className="w-full bg-sudan-green hover:bg-green-800 text-white py-3 rounded-lg font-bold shadow transition-all">
                           إنشاء الهوية الرقمية
                        </button>
                     </div>
                  ) : (
                     <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <AlertTriangle className="text-red-600 w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-red-800 mb-2">فشل التحقق</h3>
                        <p className="text-red-700 text-sm mb-6">{verificationResult.reason}</p>
                        <button onClick={() => setCurrentStep(AppStep.DATA_ENTRY)} className="w-full bg-white border border-red-300 text-red-700 hover:bg-red-50 py-3 rounded-lg font-bold transition-all">
                           مراجعة البيانات والمحاولة مرة أخرى
                        </button>
                     </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Step 5 & 6: Digital ID Preview & Print */}
          {(currentStep === AppStep.ID_GENERATION || currentStep === AppStep.PRINT_MODE) && (
            <div className="p-8 flex flex-col items-center justify-center min-h-full print:p-0 print:h-full print:w-full print:flex print:items-center print:justify-center">
               <h2 className="text-2xl font-bold mb-8 text-gray-800 no-print flex items-center gap-2">
                 <Fingerprint className="text-sudan-green" />
                 هويتك الرقمية جاهزة
               </h2>
               
               <div className="mb-10 w-full flex justify-center print:mb-0 print:w-full print:flex print:items-center print:justify-center">
                  <DigitalCard userData={userData} photoUrl={previews.selfie} />
               </div>

               <div className="flex gap-4 no-print w-full max-w-md">
                 <button 
                    onClick={handleReset} 
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                 >
                    <Home size={20} />
                    الرئيسية
                 </button>
                 <button 
                    onClick={handleDownload}
                    className="flex-1 px-4 py-3 bg-sudan-green hover:bg-green-800 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                 >
                    <Download size={20} />
                    تنزيل الهوية (PDF)
                 </button>
               </div>
               
               <p className="mt-8 text-xs text-gray-400 no-print">
                 ملاحظة: يمكنك حفظ البطاقة كملف PDF. تأكد من تفعيل "Background Graphics" في إعدادات المتصفح.
               </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}