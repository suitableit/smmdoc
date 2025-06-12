// import BreadCrumb from '@/components/shared/BreadCrumb';
import { AddFundForm } from '@/app/(protected)/add-funds/addFunds';
import { FaWallet, FaCreditCard, FaShieldAlt } from 'react-icons/fa';

export default function AddFundsPage() {
 return (
   <div className="page-container">
     <div className="page-content">
         <AddFundForm />
     </div>
   </div>
 );
}