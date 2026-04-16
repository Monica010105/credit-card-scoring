import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`;

function ScoreGauge({ score }) {
  const rotation = Math.min(Math.max((score / 100) * 180, 0), 180) - 90;
  
  let colorClass = "text-reject";
  if (score > 80) colorClass = "text-approve";
  else if (score > 50) colorClass = "text-review";

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 border-8 border-gray-200 rounded-full"></div>
        <div 
          className={`absolute top-0 left-0 w-48 h-48 border-8 border-transparent border-t-current border-l-current rounded-full transition-transform duration-1000 ease-out ${colorClass}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        ></div>
      </div>
      <div className="mt-4 text-3xl font-bold">{score.toFixed(1)} / 100</div>
      <div className="text-gray-500 uppercase text-xs mt-1">Your Credit Score</div>
    </div>
  );
}

export default function UserPanel() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    MonthlyIncome: "",
    DebtRatio: "",
    RevolvingUtilizationOfUnsecuredLines: "",
    NumberOfTime30_59DaysPastDueNotWorse: "",
    NumberOfOpenCreditLinesAndLoans: "",
    NumberOfTimes90DaysLate: "",
    NumberRealEstateLoansOrLines: "",
    NumberOfTime60_89DaysPastDueNotWorse: "",
    NumberOfDependents: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Convert empty strings to 0 for backend requirements
    const payload = { ...formData };
    Object.keys(payload).forEach(key => {
      if (key !== 'name') {
        payload[key] = parseFloat(payload[key]) || 0;
      }
    });

    try {
      const response = await axios.post(`${API_URL}/predict`, payload);
      setResult(response.data);
    } catch (err) {
      setError('Error processing prediction. Please make sure the backend API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      <div className="card w-full lg:w-2/3">
        <h2 className="text-2xl font-semibold mb-2">Loan Application Form</h2>
        <p className="text-gray-500 mb-6 text-sm">Please fill out the details below as accurately as possible so we can instantly estimate your credit risk and loan eligibility.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">What is your Full Name?</label>
              <input type="text" name="name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field bg-gray-50" required placeholder="e.g. Aditi Sharma" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">How old are you? (Years)</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-field bg-gray-50" required />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">What is your total monthly income? ($)</label>
              <input type="number" name="MonthlyIncome" value={formData.MonthlyIncome} onChange={handleChange} className="input-field bg-gray-50" required />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">How many people depend on your income?</label>
              <input type="number" name="NumberOfDependents" value={formData.NumberOfDependents} onChange={handleChange} className="input-field bg-gray-50" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">How much of your credit limit do you currently use? (0.0 to 1.0)</label>
              <input type="number" step="0.01" name="RevolvingUtilizationOfUnsecuredLines" value={formData.RevolvingUtilizationOfUnsecuredLines} onChange={handleChange} className="input-field" title="For example, 0.3 means you use 30% of your total credit limit." placeholder="0.3" />
              <span className="text-xs text-blue-600 mt-1 block">E.g., 0.3 means 30% used.</span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">What is your monthly debt payments divided by your income? (0.0 to 1.0)</label>
              <input type="number" step="0.01" name="DebtRatio" value={formData.DebtRatio} onChange={handleChange} className="input-field" placeholder="0.4" />
              <span className="text-xs text-blue-600 mt-1 block">E.g., 0.4 means 40% goes to debt.</span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">How many active credit cards or loans do you have?</label>
              <input type="number" name="NumberOfOpenCreditLinesAndLoans" value={formData.NumberOfOpenCreditLinesAndLoans} onChange={handleChange} className="input-field" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">How many active mortgages or real estate loans do you have?</label>
              <input type="number" name="NumberRealEstateLoansOrLines" value={formData.NumberRealEstateLoansOrLines} onChange={handleChange} className="input-field" />
            </div>
          </div>
          
          <hr className="my-6 border-gray-200" />
          <h3 className="text-lg font-medium text-gray-800">Past Payment History</h3>
          <p className="text-xs text-gray-400 mb-4">Leave as 0 if you always pay on time.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Times you paid 1 to 2 months late</label>
              <input type="number" name="NumberOfTime30_59DaysPastDueNotWorse" value={formData.NumberOfTime30_59DaysPastDueNotWorse} onChange={handleChange} className="input-field border-amber-200 focus:border-amber-500 focus:ring-amber-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Times you paid 2 to 3 months late</label>
              <input type="number" name="NumberOfTime60_89DaysPastDueNotWorse" value={formData.NumberOfTime60_89DaysPastDueNotWorse} onChange={handleChange} className="input-field border-orange-300 focus:border-orange-500 focus:ring-orange-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Times you paid 3+ months late</label>
              <input type="number" name="NumberOfTimes90DaysLate" value={formData.NumberOfTimes90DaysLate} onChange={handleChange} className="input-field border-red-300 focus:border-red-500 focus:ring-red-500" />
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-md font-medium text-sm">{error}</div>}
          
          <button type="submit" className="w-full btn mt-6 flex justify-center items-center h-14 text-lg shadow-md" disabled={loading}>
            {loading ? (
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : "Calculate AI Decision & Risk Score"}
          </button>
        </form>
      </div>

      <div className="w-full lg:w-1/3 space-y-6">
        <div className="card text-center min-h-[450px] flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 border-t-4 border-t-blue-600">
          {result ? (
            <div className="animate-fade-in w-full">
              <h3 className="text-xl font-bold text-gray-700 mb-6">AI Decision Summary</h3>
              
              <ScoreGauge score={result.credit_score} />
              
              <div className="mt-8 p-5 rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">Likelihood of Defaulting</div>
                <div className="text-3xl font-black text-gray-800">{(result.probability * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-400 mt-2">Based on historical data patterns.</div>
              </div>

              <div className="mt-8">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Final Loan Status</div>
                <div className={`text-2xl tracking-wide font-black py-4 px-6 rounded-lg text-white shadow-lg ${result.decision === 'APPROVE' ? 'bg-approve shadow-green-200' : result.decision === 'REVIEW' ? 'bg-review shadow-yellow-200' : 'bg-reject shadow-red-200'}`}>
                  {result.decision}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 p-8 flex flex-col items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Application Submitted</h3>
              <p className="text-sm">Submit the loan application form on the left to see our AI's immediate decision.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
