import React from 'react';
import { DigitalCard } from './DigitalCard';
import { UserData } from '../types';
import { ArrowLeft, Shield, CheckCircle, Zap, Cpu, Fingerprint, Globe } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

// Sample data for the showcase card
const sampleUserData: UserData = {
  firstName: "أحمد",
  secondName: "عبدالله",
  thirdName: "محمد",
  fourthName: "صالح",
  nationalId: "123-456-789-00",
  birthDate: "1995-05-20",
  birthPlace: "Khartoum",
  bloodType: "O+",
  jobTitle: "مهندس برمجيات",
  address: "الخرطوم - الرياض",
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-right" dir="rtl">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#004d1c] to-[#002e11] text-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sudan-red rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-sudan-gold rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-sudan-red animate-pulse"></span>
                <span className="text-sm font-medium tracking-wide">بوابة السودان الرقمية 2030</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black leading-tight">
                هويتك السودانية.. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sudan-gold to-yellow-200">
                  ببصمة ذكية
                </span>
              </h1>
              
              <p className="text-xl text-gray-200 leading-relaxed max-w-2xl border-r-4 border-sudan-gold pr-6">
                نظام متطور لإصدار الهوية الرقمية الموحدة باستخدام تقنيات الذكاء الاصطناعي. 
                أمان عالي، سرعة في الإجراءات، وتصميم يجمع بين الأصالة والحداثة.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={onStart}
                  className="group bg-sudan-gold hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-3"
                >
                  إصدار هويتك الآن
                  <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 rounded-xl font-bold text-lg border border-white/30 hover:bg-white/10 transition-all text-white">
                  تعرف على المزيد
                </button>
              </div>
            </div>

            {/* Visual Showcase */}
            <div className="relative perspective-1000 hidden lg:block">
               <div className="relative transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                  <div className="absolute -inset-4 bg-sudan-green/30 blur-2xl rounded-full"></div>
                  <div className="scale-90 origin-top-right">
                     <DigitalCard userData={sampleUserData} photoUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=400" />
                  </div>
               </div>
            </div>

          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">لماذا الهوية الرقمية؟</h2>
            <div className="w-20 h-1 bg-sudan-green mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">نجمع بين أحدث التقنيات العالمية ومعايير الأمان الوطنية لتقديم وثيقة رسمية تواكب المستقبل.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Cpu size={32} className="text-sudan-green" />}
              title="ذكاء اصطناعي متطور"
              desc="نستخدم خوارزميات Google Gemini للتحقق من تطابق الوجه والبيانات بدقة تصل إلى 99%."
            />
            <FeatureCard 
              icon={<Shield size={32} className="text-sudan-red" />}
              title="أمان وتشفير عالي"
              desc="علامات مائية، شريحة ذكية افتراضية، وباركود مشفر لحماية بياناتك من التزوير."
            />
            <FeatureCard 
              icon={<Zap size={32} className="text-sudan-gold" />}
              title="إصدار فوري"
              desc="لا داعي للانتظار في الصفوف. احصل على هويتك واطبعها في أقل من 5 دقائق."
            />
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-100 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">كيف يعمل النظام؟</h2>
            <p className="mt-4 text-gray-500">ثلاث خطوات بسيطة تفصلك عن هويتك الجديدة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 right-[16%] left-[16%] h-0.5 bg-gray-300 -z-10"></div>

            <StepCard 
              num="01" 
              title="أدخل بياناتك" 
              desc="قم بتعبئة الرقم الوطني والبيانات الشخصية بدقة." 
            />
            <StepCard 
              num="02" 
              title="ارفع المستندات" 
              desc="صورة سيلفي حديثة + صورة واضحة لجواز السفر." 
            />
            <StepCard 
              num="03" 
              title="التحقق والإصدار" 
              desc="يقوم النظام بالمطابقة ثم إصدار البطاقة فوراً للطباعة." 
            />
          </div>

          <div className="mt-16 text-center">
            <button 
              onClick={onStart}
              className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <Fingerprint className="text-sudan-green" />
              ابدأ الخدمة الآن
            </button>
          </div>
        </div>
      </div>

      {/* Info / Ad Banner */}
      <div className="bg-sudan-green py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
           <div className="text-white">
             <h3 className="text-2xl font-bold mb-2">رؤية التحول الرقمي</h3>
             <p className="text-green-100 max-w-xl">
               يأتي هذا المشروع ضمن مبادرة الحكومة الإلكترونية لتسهيل الخدمات للمواطنين داخل وخارج السودان، مما يضمن سهولة الوصول للمعلومات وتقليل البيروقراطية.
             </p>
           </div>
           <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur p-4 rounded-lg border border-white/20 text-center text-white min-w-[100px]">
                 <span className="block text-3xl font-bold">24/7</span>
                 <span className="text-xs opacity-80">خدمة متوفرة</span>
              </div>
              <div className="bg-white/10 backdrop-blur p-4 rounded-lg border border-white/20 text-center text-white min-w-[100px]">
                 <span className="block text-3xl font-bold">100%</span>
                 <span className="text-xs opacity-80">مجاني</span>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t-4 border-sudan-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Globe size={20} className="text-white" />
             </div>
             <div>
               <h4 className="text-white font-bold">وزارة الداخلية</h4>
               <span className="text-xs">السجل المدني - الإدارة العامة للتقانة</span>
             </div>
          </div>
          <div className="text-sm text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} نظام الهوية الرقمية السودانية. جميع الحقوق محفوظة.</p>
            <p className="mt-1 opacity-80 font-medium text-sudan-gold">تم التصميم بواسطة ريم بابكر</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-sudan-green/30 hover:shadow-lg transition-all duration-300 group">
    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const StepCard = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative z-10 hover:-translate-y-2 transition-transform duration-300">
    <span className="text-6xl font-black text-gray-100 absolute top-4 left-6 -z-10">{num}</span>
    <div className="w-12 h-12 bg-sudan-green rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto shadow-lg shadow-green-200">
      {num}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </div>
);