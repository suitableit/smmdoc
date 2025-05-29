/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import ButtonLoader from '@/components/button-loader';
import { PasswordInput } from '@/components/passwordInput';
import { Switch } from '@/components/ui/switch';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { generateApiKeys, getApiKey } from '@/lib/actions/apiKey';
import { changePassword } from '@/lib/actions/changPassword';
import { getUserDetails } from '@/lib/actions/getUser';
import { toggleTwoFactor } from '@/lib/actions/login';
import { setUserDetails } from '@/lib/slice/userDetails';
import { PasswordForm, passwordSchema } from '@/lib/validators/auth.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
interface ApiKey {
  key: string;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  userId: string;
}

const ProfilePage = () => {
  const user = useCurrentUser();
  const { rate } = useCurrency();
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.userDetails);
  async function fetchUser() {
    const userDetails = await getUserDetails();
    if (userDetails) {
      dispatch(setUserDetails(userDetails));
      return userDetails;
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);

  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [twoFactor, setTwoFactor] = useState<boolean>(false);

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey?.key || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // Handle password change
  const onSubmit = async (data: PasswordForm) => {
    try {
      setIsLoading(true);
      const res = await changePassword(data);
      if (res.success) {
        toast.success(res.message);
        reset();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error('Password update failed!');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle two-factor authentication toggle
  const handleTwoFactorToggle = async () => {
    const nextState = !twoFactor;
    const res = await toggleTwoFactor(nextState);

    if (res.success) {
      setTwoFactor(nextState);
      toast.success(
        `Two-factor authentication ${nextState ? 'enabled' : 'disabled'}.`
      );
    } else {
      toast.error(res.error || 'Something went wrong!');
    }
  };

  useEffect(() => {
    const fetchTwoFactorStatus = async () => {
      if (user?.isTwoFactorEnabled !== undefined) {
        setTwoFactor(user?.isTwoFactorEnabled);
      }
    };
    fetchTwoFactorStatus();
  }, [user]);
  const fetchApiKey = async () => {
    const res = await getApiKey();
    if (res.success) {
      setApiKey(res?.data as ApiKey);
    }
  };
  useEffect(() => {
    fetchApiKey();
  }, []);

  // handle api key generation
  const handleApiKeyGeneration = async () => {
    const res = await generateApiKeys();
    if (res.success) {
      fetchApiKey();
      toast.success('API Key generated successfully!');
    } else {
      toast.error('API Key generation failed!');
    }
  };

  console.log('User Data:', userData);

  return (
    <div className="space-y-6">
      {/* Profile and Stats */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-5 p-4 border rounded-xl shadow space-y-2">
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-2">
            {/* <Image
              src={
                'https://res.cloudinary.com/ddxqljriw/image/upload/v1711623691/samples/man-portrait.jpg'
              }
              alt="Profile Picture"
              width={96}
              height={96}
            /> */}
          </div>
          <div className="flex justify-center items-center flex-col">
            <p className="text-md">
              <strong>Name:</strong> {user?.name || 'John Doe'}
            </p>
            <p className="text-md">
              <strong>Email:</strong> {user?.email || 'awal@gmail.com'}
            </p>
            <p className="text-md">
              <strong>Role:</strong> {user?.role || 'User'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded-xl shadow text-center">
            <p className="text-sm text-gray-600">Current Balance</p>
            {/* <p className="text-xl lg:text-2xl lg:mt-1 font-bold"></p> */}
            {userData?.addFunds[0]?.amount ? (
              <p className="text-xl lg:text-2xl lg:mt-1 font-bold">
                {userData?.currency === 'USD'
                  ? `$${userData?.addFunds[0]?.amount}`
                  : `৳${(userData?.addFunds[0]?.amount * (rate || 1)).toFixed(
                      2
                    )}`}
              </p>
            ) : (
              <p className="text-xl lg:text-2xl lg:mt-1 font-bold">৳0.00</p>
            )}
          </div>
          {/* <div className="p-4 border rounded-xl shadow text-center">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-xl lg:text-2xl lg:mt-1 font-bold">
              {userData?.orders?.length || 0}
            </p>
          </div> */}
        </div>
      </div>

      {/* Change Password */}
      <div className="border p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold mb-2">Change Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current Password
            </label>
            <PasswordInput
              {...register('currentPass')}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.currentPass && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPass.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <PasswordInput
              {...register('newPass')}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.newPass && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPass.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <PasswordInput
              {...register('confirmNewPass')}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmNewPass && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmNewPass.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {isLoading ? <ButtonLoader /> : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Two Factor Auth */}
      <div className="border p-6 rounded-xl shadow flex items-center justify-between">
        <div>
          <h3>Two-factor authentication</h3>
          <p className="text-sm text-gray-500">
            Email-based option to add an extra layer of protection to your
            account. When signing in you’ll need to enter a code that will be
            sent to your email address.
          </p>
        </div>
        <Switch
          checked={twoFactor}
          onCheckedChange={setTwoFactor}
          onClick={handleTwoFactorToggle}
          title={`${
            twoFactor ? 'Disable' : 'Enable'
          } Two-Factor Authentication`}
        />
      </div>

      {/* API Key Section */}
      <div className="border p-6 rounded-xl shadow space-y-3">
        <label className="block text-sm font-medium mb-1">API Key</label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 relative">
          <input
            type="text"
            readOnly
            value={apiKey?.key || '***********************************'}
            className="w-full sm:flex-1 px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-2">
            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              disabled={!apiKey}
              title="Copy API Key"
              className="px-3 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300 transition dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              📋 Copy
            </button>

            {/* Regenerate Button with tooltip */}
            <div className="relative group">
              <button
                onClick={() => handleApiKeyGeneration()}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
              >
                {apiKey ? '🔁 Regenerate' : '🔑 Generate'}
              </button>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-black text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap">
                Generate a new API key
              </div>
            </div>
          </div>
          {/* Copied Tooltip */}
          {copied && (
            <span className="text-green-600 text-xs absolute right-0 -bottom-5 animate-pulse">
              Copied!
            </span>
          )}
          {/* Created Date */}
          {apiKey?.key && (
            <span className="absolute -bottom-6 text-xs mb-1">
              Created On:{' '}
              {new Date(apiKey?.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
              {', '}
              {new Date(apiKey?.createdAt).toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
