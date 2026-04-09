import React, { useState, useEffect } from 'react';
import { VerificationLog, UserData } from '../types';
import { Lock, LogOut, FileText, CheckCircle, XCircle, Shield, Users, Search, Download, ArrowRight, Eye } from 'lucide-react';
import { DigitalCard } from './DigitalCard';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, getDocs, where, limit, Timestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface AdminDashboardProps {
  onLogout: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

type AdminTab = 'dashboard' | 'search';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, isLoggedIn, setIsLoggedIn }) => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VerificationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<VerificationLog | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchLogs = async () => {
        try {
          const res = await fetch('/api/logs');
          const data = await res.json();
          setLogs(data.map((l: any) => ({
            ...l,
            timestamp: new Date(l.timestamp),
            userData: typeof l.userData === 'string' ? JSON.parse(l.userData) : l.userData
          })));
        } catch (err) {
          console.error("Error fetching logs:", err);
        }
      };
      fetchLogs();
      const interval = setInterval(fetchLogs, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user is the admin email
      if (result.user.email === 'altajm41@gmail.com') {
        setIsLoggedIn(true);
        setError('');
      } else {
        await signOut(auth);
        setError('عذراً، ليس لديك صلاحيات المسؤول');
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError('فشل تسجيل الدخول');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/logs/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.map((l: any) => ({
        ...l,
        timestamp: new Date(l.timestamp),
        userData: typeof l.userData === 'string' ? JSON.parse(l.userData) : l.userData
      })));
      setSelectedLog(null);
    } catch (err) {
      console.error("Search Error:", err);
    }
  };

  const handleDownloadCard = () => {
    if (selectedLog) {
      const originalTitle = document.title;
      document.title = `IDS_ADMIN_${selectedLog.nationalId}`;
      window.print();
      document.title = originalTitle;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-sudan-green/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-sudan-green" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">تسجيل دخول المسؤول</h2>
            <p className="text-sm text-gray-500 mt-2">نظام إدارة الهوية الرقمية</p>
          </div>
          
          <div className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button 
              onClick={handleLogin}
              className="w-full bg-sudan-green hover:bg-green-800 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              تسجيل الدخول بواسطة Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  const approvedCount = logs.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = logs.filter(l => l.status === 'REJECTED').length;

  return (
    <div className="p-0 min-h-[600px] flex flex-col">
      {/* Admin Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white no-print">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-sudan-green" size={24} />
              لوحة التحكم
            </h2>
            <p className="text-xs text-gray-500">نظام إدارة السجل المدني</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mr-6">
             <button 
               onClick={() => { setActiveTab('dashboard'); setSelectedLog(null); }}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <Users size={16} />
               الرئيسية
             </button>
             <button 
               onClick={() => { setActiveTab('search'); setSelectedLog(null); }}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'search' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <Search size={16} />
               بحث عن هوية
             </button>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          خروج
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-50 p-6 print:p-0 print:bg-white print:flex print:items-center print:justify-center">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{logs.length}</h3>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">تمت الموافقة</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</h3>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">مرفوضة</p>
                    <h3 className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</h3>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <XCircle className="text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={18} />
                  سجل العمليات الحديثة
                </h3>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Live Updates</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">التوقيت</th>
                      <th className="px-6 py-3">الرقم الوطني</th>
                      <th className="px-6 py-3">الاسم</th>
                      <th className="px-6 py-3">الحالة</th>
                      <th className="px-6 py-3">نسبة التطابق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          لا توجد سجلات حتى الآن
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap" dir="ltr">
                            {log.timestamp.toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-3 font-mono">{log.nationalId}</td>
                          <td className="px-6 py-3 font-medium">{log.fullName}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              log.status === 'APPROVED' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {log.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {log.confidence}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && (
           <div className="h-full print:w-full print:h-full print:flex print:items-center print:justify-center">
              {/* Search Details View (Card) */}
              {selectedLog ? (
                <div className="flex flex-col items-center animate-fade-in print:w-full">
                   <div className="w-full max-w-4xl mb-6 flex items-center justify-between no-print">
                      <button 
                        onClick={() => setSelectedLog(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
                      >
                         <ArrowRight size={18} />
                         العودة للبحث
                      </button>
                      <h3 className="font-bold text-xl">تفاصيل الهوية</h3>
                      <button 
                        onClick={handleDownloadCard}
                        className="flex items-center gap-2 bg-sudan-green text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors shadow-sm"
                      >
                         <Download size={18} />
                         تنزيل الهوية (PDF)
                      </button>
                   </div>
                   
                   <div className="bg-gray-200 p-8 rounded-xl w-full flex justify-center print:p-0 print:bg-white print:w-full">
                      <DigitalCard userData={selectedLog.userData} photoUrl={selectedLog.photoUrl} />
                   </div>
                   
                   <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 w-full max-w-2xl no-print">
                      <h4 className="font-bold border-b pb-2 mb-4">معلومات التحقق</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                         <div>
                            <span className="text-gray-500 block">توقيت العملية</span>
                            <span className="font-mono">{selectedLog.timestamp.toLocaleString()}</span>
                         </div>
                         <div>
                            <span className="text-gray-500 block">حالة التحقق</span>
                            <span className={selectedLog.status === 'APPROVED' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                               {selectedLog.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                            </span>
                         </div>
                         <div>
                            <span className="text-gray-500 block">نسبة المطابقة</span>
                            <span className="font-bold">{selectedLog.confidence}%</span>
                         </div>
                         <div>
                            <span className="text-gray-500 block">معرف العملية</span>
                            <span className="font-mono text-xs">{selectedLog.id}</span>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                /* Search Input & List View */
                <div className="animate-fade-in">
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
                     <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                           <input 
                             type="text" 
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             placeholder="ادخل الرقم الوطني أو الاسم..."
                             className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sudan-green focus:border-transparent outline-none"
                           />
                           <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <button type="submit" className="bg-sudan-green text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors">
                           بحث
                        </button>
                     </form>
                  </div>

                  {searchResults.length > 0 && (
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                           <h3 className="font-bold text-gray-800">نتائج البحث ({searchResults.length})</h3>
                        </div>
                        <table className="w-full text-sm text-right">
                           <thead className="bg-gray-50 text-gray-500 font-medium">
                              <tr>
                                 <th className="px-6 py-3">الرقم الوطني</th>
                                 <th className="px-6 py-3">الاسم</th>
                                 <th className="px-6 py-3">الحالة</th>
                                 <th className="px-6 py-3">إجراءات</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {searchResults.map((log) => (
                                 <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-mono">{log.nationalId}</td>
                                    <td className="px-6 py-3 font-medium">{log.fullName}</td>
                                    <td className="px-6 py-3">
                                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                          log.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                       }`}>
                                          {log.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                                       </span>
                                    </td>
                                    <td className="px-6 py-3">
                                       <button 
                                         onClick={() => setSelectedLog(log)}
                                         className="text-sudan-green hover:text-green-800 font-medium flex items-center gap-1"
                                       >
                                          <Eye size={16} />
                                          عرض التفاصيل
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}

                  {searchResults.length === 0 && searchQuery && (
                     <div className="text-center py-12 text-gray-500">
                        <p>لا توجد نتائج تطابق بحثك</p>
                     </div>
                  )}
                </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};