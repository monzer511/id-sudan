import React from 'react';
import { UserData } from '../types';

interface DigitalCardProps {
  userData: UserData;
  photoUrl: string | null;
}

// Helper to generate MRZ (Machine Readable Zone) simulation
const generateMRZ = (userData: UserData) => {
  const lastName = userData.fourthName.toUpperCase() || 'UNKNOWN';
  const firstName = userData.firstName.toUpperCase() || 'UNKNOWN';
  const id = userData.nationalId.padEnd(14, '<');
  const birthDateFormatted = userData.birthDate.replace(/-/g, '').slice(2);
  
  // Simulated checksums
  return {
    line1: `IDSDN${lastName}<<${firstName}<<<<<<<<<<<<<<<<<`.substring(0, 30),
    line2: `${id}SDN${birthDateFormatted}<M<<<<<<<<<<<`.substring(0, 30),
    line3: `${userData.nationalId}<<${lastName}<<${firstName}<<<<<<<<`
  };
};

// High quality Sudan Emblem URL
const EMBLEM_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Emblem_of_Sudan.svg/800px-Emblem_of_Sudan.svg.png";

export const DigitalCard: React.FC<DigitalCardProps> = ({ userData, photoUrl }) => {
  const mrz = generateMRZ(userData);
  const fullName = `${userData.firstName} ${userData.secondName} ${userData.thirdName} ${userData.fourthName}`.trim();
  
  // Create QR Data
  const qrData = JSON.stringify({
    n: fullName,
    id: userData.nationalId,
    b: userData.bloodType,
  });
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="flex flex-col gap-10 items-center w-full print:gap-8 print:w-full print:items-center print:justify-center font-sans">
      
      {/* ================= FRONT SIDE ================= */}
      <div className="relative w-[85.6mm] h-[53.98mm] rounded-xl overflow-hidden shadow-2xl bg-[#fdfdfd] print:shadow-none print:border print:border-gray-300 mx-auto perspective-1000 transform transition-transform hover:scale-[1.02] print:transform-none text-gray-800">
        
        {/* Security Background Layer */}
        <div className="absolute inset-0 bg-guilloche opacity-30 z-0 pointer-events-none"></div>
        {/* Geometric Overlay */}
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{backgroundImage: 'radial-gradient(circle at 10% 20%, #007229 0%, transparent 20%), radial-gradient(circle at 90% 80%, #D21034 0%, transparent 20%)'}}>
        </div>

        {/* HEADER BAR */}
        <div className="absolute top-0 left-0 w-full h-[10mm] bg-[#005c20] z-10 flex items-center justify-between px-3 overflow-hidden">
             {/* Decorative curves */}
             <div className="absolute -left-2 top-0 w-20 h-full bg-[#D21034] transform -skew-x-[20deg] z-0 opacity-90"></div>
             <div className="absolute -left-4 top-0 w-10 h-full bg-white transform -skew-x-[20deg] z-0 opacity-20"></div>

             <div className="z-10 flex flex-col text-white leading-none pl-6">
                 <span className="text-[5px] uppercase tracking-[1px] font-medium opacity-80">Republic of Sudan</span>
                 <span className="text-[8px] font-bold uppercase tracking-wide">National Identity Card</span>
             </div>

             <div className="z-10 flex items-center gap-2">
                 <div className="flex flex-col text-white text-right leading-none">
                     <span className="text-[8px] font-bold">جمهورية السودان</span>
                     <span className="text-[5px] opacity-80">البطاقة القومية</span>
                 </div>
                 <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20 p-0.5">
                    <img src={EMBLEM_URL} alt="Emblem" className="w-full h-full object-contain" />
                 </div>
             </div>
        </div>

        {/* CONTENT */}
        <div className="absolute top-[10mm] left-0 w-full h-[calc(100%-10mm)] p-3 flex z-10">
            
            {/* Left Column: Photo & Chip */}
            <div className="w-[28%] h-full flex flex-col items-center justify-between py-1">
                {/* Photo */}
                <div className="w-full aspect-[3/4] bg-gray-200 rounded-[4px] overflow-hidden border border-gray-300 relative shadow-sm">
                    {photoUrl ? (
                      <img src={photoUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[8px] text-gray-400">PHOTO</div>
                    )}
                    {/* Ghost Overlay */}
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-t from-white/30 to-transparent"></div>
                    <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/30 backdrop-blur-sm"></div>
                </div>

                {/* Smart Chip Simulation */}
                <div className="w-10 h-8 bg-gradient-to-br from-[#e6cfa5] via-[#d4af37] to-[#bfa050] rounded-md border border-[#a08535] relative overflow-hidden shadow-sm flex items-center justify-center opacity-90">
                    <div className="w-full h-[1px] bg-[#8a702a] absolute top-1/2"></div>
                    <div className="h-full w-[1px] bg-[#8a702a] absolute left-1/3"></div>
                    <div className="h-full w-[1px] bg-[#8a702a] absolute right-1/3"></div>
                    <div className="w-4 h-4 rounded border border-[#8a702a] absolute"></div>
                </div>
            </div>

            {/* Right Column: Data */}
            <div className="flex-1 pl-3 flex flex-col pt-1">
                
                {/* Name */}
                <div className="mb-2">
                    <div className="flex justify-between items-baseline border-b border-gray-200/60 pb-0.5">
                       <span className="text-[6px] text-gray-500 uppercase font-semibold">Name / الاسم</span>
                    </div>
                    <div className="flex flex-col mt-0.5">
                        <span className="text-[10px] font-bold text-gray-800 leading-tight">{fullName}</span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-1 mb-2">
                    <div className="col-span-1">
                        <span className="block text-[5px] text-gray-500 uppercase">Birth Date</span>
                        <span className="block text-[9px] font-bold text-gray-800 font-mono">{userData.birthDate}</span>
                    </div>
                    <div className="col-span-1">
                         <span className="block text-[5px] text-gray-500 uppercase">Sex / الجنس</span>
                         <span className="block text-[9px] font-bold text-gray-800">M / ذكر</span>
                    </div>
                    <div className="col-span-1 text-right">
                         <span className="block text-[5px] text-gray-500 uppercase">Blood Group</span>
                         <span className="block text-[9px] font-bold text-gray-800">{userData.bloodType}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1 mb-3">
                    <div className="col-span-1">
                        <span className="block text-[5px] text-gray-500 uppercase">Place of Birth</span>
                        <span className="block text-[8px] font-bold text-gray-800 uppercase">Sudan / السودان</span>
                    </div>
                    <div className="col-span-1">
                        <span className="block text-[5px] text-gray-500 uppercase">Expiry Date</span>
                        <span className="block text-[8px] font-bold text-gray-800 uppercase">
                           {new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0]}
                        </span>
                    </div>
                </div>

                {/* National ID Highlight */}
                <div className="mt-auto">
                    <span className="block text-[6px] text-[#D21034] uppercase font-bold tracking-wider">National No / الرقم الوطني</span>
                    <span className="block text-[14px] font-black text-[#D21034] tracking-widest font-mono drop-shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                        {userData.nationalId}
                    </span>
                </div>
            </div>
        </div>

        {/* Holographic Seal (Simulated) */}
        <div className="absolute right-4 bottom-14 w-12 h-12 rounded-full opacity-20 pointer-events-none z-20 flex items-center justify-center border-2 border-dashed border-gray-400">
            <img src={EMBLEM_URL} className="w-8 h-8 opacity-50 grayscale" />
        </div>
      </div>

      {/* ================= BACK SIDE ================= */}
      <div className="relative w-[85.6mm] h-[53.98mm] rounded-xl overflow-hidden shadow-2xl bg-[#fdfdfd] print:shadow-none print:border print:border-gray-300 mx-auto perspective-1000 transform transition-transform hover:scale-[1.02] print:transform-none text-gray-800">
         
         <div className="absolute inset-0 bg-guilloche opacity-20 z-0"></div>
         
         {/* Top Strip (Black) */}
         <div className="absolute top-4 left-0 w-full h-[8mm] bg-black z-10 flex items-center justify-center">
             <span className="text-white/40 text-[6px] tracking-[4px]">SUDAN CIVIL REGISTRY</span>
         </div>

         <div className="absolute top-[14mm] w-full px-4 flex gap-4 z-10">
             
             {/* QR Code */}
             <div className="w-[18mm]">
                 <div className="bg-white p-0.5 border border-gray-200">
                    <img src={qrUrl} alt="QR" className="w-full h-auto" />
                 </div>
             </div>

             {/* Secondary Data */}
             <div className="flex-1 flex flex-col gap-2 pt-1">
                 <div>
                     <div className="flex justify-between items-center border-b border-gray-200 pb-0.5">
                        <span className="text-[5px] text-gray-500 uppercase">Occupation / المهنة</span>
                     </div>
                     <span className="text-[9px] font-bold text-gray-800" dir="rtl">{userData.jobTitle}</span>
                 </div>
                 
                 <div>
                     <div className="flex justify-between items-center border-b border-gray-200 pb-0.5">
                        <span className="text-[5px] text-gray-500 uppercase">Address / العنوان</span>
                     </div>
                     <span className="text-[8px] font-medium text-gray-800" dir="rtl">{userData.address}</span>
                 </div>

                 <div className="flex justify-between mt-1">
                     <div className="flex flex-col">
                        <span className="text-[5px] text-gray-500 uppercase">Issue Date</span>
                        <span className="text-[7px] font-bold">{new Date().toISOString().split('T')[0]}</span>
                     </div>
                     <div className="flex flex-col text-right">
                        <span className="text-[5px] text-gray-500 uppercase">Authority</span>
                        <span className="text-[7px] font-bold">MOI - KRT</span>
                     </div>
                 </div>
             </div>
         </div>

         {/* MRZ Area */}
         <div className="absolute bottom-0 left-0 w-full h-[14mm] bg-white/50 backdrop-blur-[1px] border-t border-gray-200 px-4 flex flex-col justify-center">
             <div className="font-mono text-[11px] leading-[11px] tracking-[1px] text-gray-800 uppercase" 
                  style={{fontFamily: '"OCR-B", "Courier New", monospace'}}>
                <p>{mrz.line1}</p>
                <p className="mt-1">{mrz.line2}</p>
             </div>
         </div>
      </div>

    </div>
  );
};