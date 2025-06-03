// import BreadCrumb from '@/components/shared/BreadCrumb';
import { AddFundForm } from '@/components/user/addFund/addFunds';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaWallet, FaCreditCard, FaShieldAlt } from 'react-icons/fa';

export default function AddFundsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white">
              <FaWallet className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] bg-clip-text text-transparent">
            Add Funds to Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Securely add funds to your account and start boosting your social media presence with our premium services.
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="relative p-4 rounded-xl backdrop-blur-lg bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-slate-900/80 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-green-500/10 dark:to-transparent opacity-50 rounded-xl" />
            <CardContent className="relative z-10 text-center p-4">
              <FaCreditCard className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">SSL encrypted transactions with UddoktaPay</p>
            </CardContent>
          </Card>

          <Card className="relative p-4 rounded-xl backdrop-blur-lg bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-slate-900/80 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-blue-500/10 dark:to-transparent opacity-50 rounded-xl" />
            <CardContent className="relative z-10 text-center p-4">
              <FaShieldAlt className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">100% Safe</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your financial data is protected</p>
            </CardContent>
          </Card>

          <Card className="relative p-4 rounded-xl backdrop-blur-lg bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-slate-900/80 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-purple-500/10 dark:to-transparent opacity-50 rounded-xl" />
            <CardContent className="relative z-10 text-center p-4">
              <FaWallet className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Credit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Funds added immediately after payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Add Fund Form */}
        <AddFundForm />

        {/* Payment Methods Info */}
        <Card className="relative rounded-xl backdrop-blur-lg bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-slate-900/80 border border-white/20 dark:border-slate-700/50 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-indigo-500/10 dark:to-transparent opacity-50 rounded-xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaCreditCard className="text-primary" />
            Accepted Payment Methods
          </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Mobile Banking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">bKash, Nagad, Rocket</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Bank Cards</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Visa, Mastercard, DBBL</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
