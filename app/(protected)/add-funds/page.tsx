// import BreadCrumb from '@/components/shared/BreadCrumb';
import { AddFundForm } from '@/components/user/addFund/addFunds';
import { FaWallet, FaCreditCard, FaShieldAlt } from 'react-icons/fa';

export default function AddFundsPage() {
 return (
   <div className="page-container">
     <div className="page-content">
       {/* Page Header */}
       <div className="page-header">
         <div className="flex items-center justify-center mb-4">
         </div>
         <h1 className="page-title">Add Funds to Your Account</h1>
         <p className="page-description">
           Securely add funds to your account and start boosting your social media presence with our premium services.
         </p>
       </div>
         <AddFundForm />
     </div>
   </div>
 );
}