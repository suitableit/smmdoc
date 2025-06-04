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

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card card-padding text-center hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-sm text-gray-600">SSL encrypted transactions with UddoktaPay</p>
          </div>

          <div className="card card-padding text-center hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Safe</h3>
            <p className="text-sm text-gray-600">Your financial data is protected</p>
          </div>

          <div className="card card-padding text-center hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FaWallet className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Credit</h3>
            <p className="text-sm text-gray-600">Funds added immediately after payment</p>
          </div>
        </div>

        {/* Main Add Fund Form */}
        <div className="card card-padding">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Funds</h2>
            <p className="text-sm text-gray-600">Choose your amount and payment method</p>
          </div>
          <AddFundForm />
        </div>
        
      </div>
    </div>
  );
}