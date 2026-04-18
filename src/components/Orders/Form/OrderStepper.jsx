import { Check } from 'lucide-react';

export default function OrderStepper({ steps, currentStep }) {
  return (
    <div className="relative mb-12 max-w-2xl mx-auto px-4">
      <div className="absolute top-6 left-6 right-6 h-1 bg-border rounded-full z-0" />
      <div 
        className="absolute top-6 left-6 h-1 bg-primary rounded-full z-0 transition-all duration-700 ease-out" 
        style={{ width: `calc(${((currentStep - 1) / 2) * 100}% - ${currentStep === 1 ? '0px' : '24px'})` }} 
      />
      
      <div className="relative z-10 flex justify-between">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-in-out ${
                isCompleted 
                  ? 'bg-primary border-primary text-white shadow-lg' 
                  : isCurrent 
                    ? 'bg-card border-primary text-primary shadow-xl shadow-primary/10' 
                    : 'bg-card border-border text-textMuted'
              }`}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`mt-4 text-xs font-bold transition-all duration-300 ${
                isCurrent ? 'text-primary' : isCompleted ? 'text-textMain' : 'text-textMuted'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
