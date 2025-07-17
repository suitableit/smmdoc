'use client';
import ButtonLoader from '@/components/button-loader';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { login } from '@/lib/actions/login';
import { DEFAULT_SIGN_IN_REDIRECT } from '@/lib/routes';
import {
    signInDefaultValues,
    SignInSchema,
    signInSchema,
} from '@/lib/validators/auth.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
    FaArrowRight,
    FaBriefcase,
    FaBullseye,
    FaChevronLeft,
    FaChevronRight,
    FaCogs,
    FaDiscord,
    FaDollarSign,
    FaFacebook,
    FaGlobe,
    FaHeadset,
    FaHome,
    FaInstagram,
    FaLinkedin,
    FaLock,
    FaPinterest,
    FaRocket,
    FaSearch,
    FaServer,
    FaShareAlt,
    FaShoppingCart,
    FaSoundcloud,
    FaSpotify,
    FaTachometerAlt,
    FaTelegram,
    FaTiktok,
    FaTrophy,
    FaTwitter,
    FaUser,
    FaUserPlus,
    FaUsers,
    FaUserShield,
    FaWallet,
    FaYoutube
} from 'react-icons/fa';

interface CounterItem {
  icon: React.ReactNode;
  title: string;
  count: string;
}

interface Platform {
  id: number;
  name: string;
  icon: string;
  title: string;
  description: string;
}

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const HomePage: React.FC = () => {
  // Get session data using NextAuth
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [urlError, setUrlError] = useState(
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? 'Email already in use with different provider!'
      : ''
  );
  const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('facebook');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if user is authenticated and get user role
  const isAuthenticated = status === 'authenticated' && session?.user;
  const isLoading = status === 'loading';
  const userRole = session?.user?.role || 'user'; // Default to 'user' if role is not set
  const isAdmin = userRole === 'admin';

  const form = useForm<SignInSchema>({
    mode: 'all',
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  });

  const onSubmit: SubmitHandler<SignInSchema> = async (values) => {
    setError('');
    setSuccess('');
    setUrlError('');

    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
            return;
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
            return;
          }

          if (data?.success) {
            // Get redirect URL
            const redirectUrl = data.redirectTo || '/dashboard';
            const isAdmin = data.isAdmin === true;

            // Set appropriate success message
            setSuccess(isAdmin
              ? 'Login successful! Redirecting to admin dashboard...'
              : 'Login successful! Redirecting to dashboard...');

            console.log('Redirect URL:', redirectUrl);

            // Force hard reload for admin dashboard to ensure proper session handling
            if (isAdmin) {
              setTimeout(() => {
                window.location.href = redirectUrl;
              }, 1000);
            } else {
              // Use router for regular users
              setTimeout(() => {
                router.push(redirectUrl);
              }, 1000);
            }
          }
        })
        .catch((err) => {
          setError('An unexpected error occurred. Please try again.');
          console.error('Login error:', err);
        });
    });
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: DEFAULT_SIGN_IN_REDIRECT });
  };

  // Statistics data
  const counterData: CounterItem[] = [
    {
      icon: <FaShoppingCart className="w-8 h-8 lg:w-10 lg:h-10 text-white" />,
      title: 'Order Completed',
      count: '1,000+',
    },
    {
      icon: <FaServer className="w-8 h-8 lg:w-10 lg:h-10 text-white" />,
      title: 'Active Services',
      count: '50+',
    },
    {
      icon: <FaUsers className="w-8 h-8 lg:w-10 lg:h-10 text-white" />,
      title: 'Active Users',
      count: '500+',
    },
    {
      icon: <FaShareAlt className="w-8 h-8 lg:w-10 lg:h-10 text-white" />,
      title: 'Affiliate Users',
      count: '100+',
    },
  ];

  // How It Works steps data
  const steps: Step[] = [
    {
      number: '01',
      icon: (
        <FaUserPlus className="w-12 h-12 text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200" />
      ),
      title: 'Free Sign Up',
      description:
        'Swiftly create your SMMDOC account to embark on your social media enhancement journey.',
    },
    {
      number: '02',
      icon: (
        <FaSearch className="w-12 h-12 text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200" />
      ),
      title: 'Explore Our Services',
      description:
        'Effortlessly browse our extensive SMM services, customized to meet your specific needs.',
    },
    {
      number: '03',
      icon: (
        <FaWallet className="w-12 h-12 text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200" />
      ),
      title: 'Add Our Funds',
      description:
        'Conveniently add funds to your account using our secure and diverse payment options.',
    },
    {
      number: '04',
      icon: (
        <FaRocket className="w-12 h-12 text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200" />
      ),
      title: 'Order and Unwind',
      description:
        'Place your order and relax while we handle your social media growth professionally.',
    },
  ];

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Tahmid Rahman',
      position: 'CEO',
      company: 'Dhaka Tech Solutions',
      content:
        "Teaming up with SMMDOC has been a game-changer for our online presence. Their budget-friendly SMM panels have amplified our engagement and notably expanded our customer base. The team's expertise and personalized strategies are precisely what we require. Highly recommended for any business aiming to make a mark on social media!",
      rating: 5,
    },
    {
      id: 2,
      name: 'Priya Singh',
      position: 'Marketing Director',
      company: 'MCA',
      content:
        "SMMDOC has transformed our social media strategy. Their Instagram and Facebook marketing approach has elevated our brand's visibility to new heights. The results have been outstanding – more engagement, followers, and conversions. Their service is top-notch and incredibly budget-friendly.",
      rating: 5,
    },
    {
      id: 3,
      name: 'Anwar Hussain',
      position: 'Founder',
      company: 'Karachi Digital Studio',
      content:
        "As a small business, we sought cost-effective yet impactful social media marketing, and SMMDOC delivered beyond our expectations. Their YouTube and TikTok SMM panels have greatly helped increase our online influence. The team's professionalism and quick response to our needs make them a valuable partner.",
      rating: 5,
    },
    {
      id: 4,
      name: 'Sarah Ahmed',
      position: 'Marketing Manager',
      company: 'Creative Agency BD',
      content:
        "Working with SMMDOC has exceeded our expectations. Their comprehensive social media solutions have helped us achieve remarkable growth across all platforms. The ROI we've seen from their services is exceptional, and their customer support is always responsive and helpful.",
      rating: 5,
    },
    {
      id: 5,
      name: 'Mohammad Ali',
      position: 'Business Owner',
      company: 'Tech Innovations Ltd',
      content:
        "SMMDOC's expertise in social media marketing is unmatched. They've helped us build a strong online community and significantly increase our brand awareness. Their strategic approach and attention to detail have made them an invaluable partner for our business growth.",
      rating: 5,
    },
    {
      id: 6,
      name: 'Fatima Khan',
      position: 'Digital Marketing Lead',
      company: 'E-commerce Solutions',
      content:
        'The results speak for themselves - since partnering with SMMDOC, our social media engagement has tripled, and our conversion rates have improved dramatically. Their team understands our industry and delivers tailored solutions that drive real business results.',
      rating: 5,
    },
  ];

  const itemsPerPage = 3;
  const maxSlide = testimonials.length - itemsPerPage;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev + 1;
        return nextSlide > maxSlide ? 0 : nextSlide;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const nextSlide = prev + 1;
      return nextSlide > maxSlide ? 0 : nextSlide;
    });
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const prevSlideIndex = prev - 1;
      return prevSlideIndex < 0 ? maxSlide : prevSlideIndex;
    });
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 transition-colors duration-200 ${
          index < rating
            ? 'text-[var(--primary)] dark:text-[var(--secondary)]'
            : 'text-gray-300 dark:text-gray-600'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * itemsPerPage;
    return testimonials.slice(startIndex, startIndex + itemsPerPage);
  };

  // FAQ data
  const faqData: FAQ[] = [
    {
      id: 1,
      question: 'What Exactly is an SMM Panel?',
      answer:
        'A Social Media Marketing (SMM) Panel is a website that offers different social media marketing services. These services help you get more followers and likes and increase your engagement and visibility on social media. SMM Panels, like SMMDOC, are made to be easy to use. They let businesses and people straightforwardly improve their social media presence.',
    },
    {
      id: 2,
      question: 'How Safe is Using an SMM Panel for My Business?',
      answer:
        'Safety is a major focus at SMMDOC. Our SMM Panel is entirely secure and follows all terms of service of social media platforms. We employ genuine marketing methods to guarantee that your accounts stay safe and your social media growth is natural and lasting.',
    },
    {
      id: 3,
      question: 'What services does SMMDOC offer?',
      answer:
        'We provide various social media marketing services, covering platforms like Facebook, Instagram, Twitter, YouTube, LinkedIn, TikTok, Telegram, Spotify, Discord, Pinterest, and SoundCloud. Additionally, we offer Website Traffic enhancement.',
    },
    {
      id: 4,
      question: 'How do I get started with SMMDOC?',
      answer:
        'Starting is simple! Just sign up for a free account on our website, check out our services, add funds to your account, and make your order. Our team will handle the growth of your social media from there.',
    },
    {
      id: 5,
      question: 'Is SMMDOC suitable for small businesses?',
      answer:
        "Certainly! Our services are crafted to be budget-friendly and impactful for businesses of all sizes. We provide custom-made solutions to small businesses' specific needs, guaranteeing they receive the best return on investment (ROI).",
    },
    {
      id: 6,
      question: 'How affordable are your services?',
      answer:
        'We take pride in providing the most competitive and budget-friendly SMM services. Our pricing is structured to accommodate various budgets, offering cost-effective solutions for your social media marketing requirements.',
    },
    {
      id: 7,
      question: 'Can I follow the progress of my social media campaigns?',
      answer:
        'Certainly! You can follow the progress of your social media campaigns with our detailed reports and analytics. This transparency enables you to see the real-time effectiveness of our strategies.',
    },
    {
      id: 8,
      question: 'What makes SMMDOC different from other SMM service providers?',
      answer:
        'Our distinctive mix of affordability, personalized strategies, skilled team, extensive range of services, and unwavering customer support makes us stand out. Our commitment goes beyond delivering results; we aim to provide our clients with a smooth and satisfying experience.',
    },
    {
      id: 9,
      question:
        'Is There a Refund Policy if I am Dissatisfied with the Services?',
      answer:
        "At SMMDOC, customer satisfaction is our top priority. If, for any reason, you are not content with our services, we provide a clear refund policy. Don't hesitate to contact our customer support with any concerns, and we will strive to address them, including issuing a refund if applicable.",
    },
    {
      id: 10,
      question: 'Do You Provide 24/7 Customer Support?',
      answer:
        'Certainly! We offer 24/7 customer support to ensure assistance is available whenever needed. Our committed team is always prepared to help with any queries or issues you may have, ensuring a smooth and hassle-free experience with our SMM Panel.',
    },
  ];

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Platforms data
  const platforms: Platform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'facebook',
      title: 'Facebook SMM Panel',
      description:
        "Optimize your Facebook presence with our Facebook SMM Panel. This service boosts your brand's visibility, increases engagement, and drives more sales through customized Facebook marketing strategies. It is ideal for businesses looking to dominate this vast social platform. We make sure your content reaches your target audience on time every time.",
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'instagram',
      title: 'Instagram SMM Panel',
      description:
        "Enhance your Instagram game with our specialized Instagram SMM Panel. We focus on more than just increasing followers, enhancing engagement, and improving your brand's visual appeal. Our Instagram marketing experts use the latest strategies to show off your brand's story creatively and effectively.",
    },
    {
      id: 'twitter',
      name: 'X/Twitter',
      icon: 'twitter',
      title: 'X/Twitter SMM Panel',
      description:
        "Spread your influence on Twitter with our unique Twitter SMM Panel. We specialize in building your follower base, boosting tweet engagement, and spreading your brand's reach. Our strategic approach ensures your message hits your target audience, keeping you trending in your industry.",
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: 'youtube',
      title: 'YouTube SMM Panel',
      description:
        "Amplify your YouTube channel's impact with our YouTube SMM Panel. We focus on increasing views, subscribers, comments, shares, and more. We ensure your content stands out every time. Our YouTube marketing experts use targeted strategies custom-made to raise your channel's visibility and keep your viewers hooked.",
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: 'linkedin',
      title: 'LinkedIn SMM Panel',
      description:
        "Transform your professional networking with our LinkedIn SMM Panel. This panel enhances your brand's corporate presence, builds connections, and generates leads. Our strategies are designed to put your brand at the top as an industry leader on this professional platform.",
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'tiktok',
      title: 'TikTok SMM Panel',
      description:
        'Capture the dynamic TikTok audience with our TikTok SMM Panel. Our service is tailored to boost your visibility, engagement, and viral potential on this rapidly growing platform. We craft strategies that resonate with the youthful and diverse TikTok community.',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: 'telegram',
      title: 'Telegram SMM Panel',
      description:
        "Expand your reach with our Telegram SMM Panel. We specialize in growing your channel subscribers and engagement, making sure your content reaches a wider audience. Our targeted approach helps you leverage Telegram's unique messaging platform for effective communication and marketing.",
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: 'spotify',
      title: 'Spotify SMM Panel',
      description:
        "Boost your musical presence with our Spotify SMM Panel. We focus on increasing your tracks' plays, followers, and playlist inclusion. Our strategies are designed to enhance your visibility and listenership on this leading music streaming platform.",
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: 'discord',
      title: 'Discord SMM Panel',
      description:
        "Enhance your community engagement with our Discord SMM Panel. We specialize in growing your server's membership and activity, creating a vibrant community around your brand. Our service is perfect for brands looking to build a loyal and engaged community.",
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: 'pinterest',
      title: 'Pinterest SMM Panel',
      description:
        "Revolutionize your visual marketing with our Pinterest SMM Panel. We focus on increasing your pins' visibility, driving traffic to your website, and boosting engagement. Our Pinterest strategies are perfect for brands that captivate audiences through compelling visual content.",
    },
    {
      id: 'website',
      name: 'Website Traffic',
      icon: 'globe',
      title: 'Website Traffic',
      description:
        "Enhance your website's prominence and attract more visitors through our Website Traffic service. Utilizing strategic SEO and cutting-edge digital marketing techniques, we elevate your site's traffic, amplifying your online visibility and the potential for business growth.",
    },
    {
      id: 'soundcloud',
      name: 'Sound Cloud',
      icon: 'soundcloud',
      title: 'SoundCloud SMM Panel',
      description:
        "Amplify your SoundCloud presence with our SoundCloud SMM Panel. We specialize in increasing your tracks' plays, likes, and reposts, enhancing your reach in the music community. Our service is tailored for artists seeking to grow their audience and influence.",
    },
  ];

  const renderIcon = (iconName: string) => {
    const iconClass =
      'w-6 h-6 text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200';

    switch (iconName) {
      case 'facebook':
        return <FaFacebook className={iconClass} />;
      case 'instagram':
        return <FaInstagram className={iconClass} />;
      case 'twitter':
        return <FaTwitter className={iconClass} />;
      case 'youtube':
        return <FaYoutube className={iconClass} />;
      case 'linkedin':
        return <FaLinkedin className={iconClass} />;
      case 'tiktok':
        return <FaTiktok className={iconClass} />;
      case 'telegram':
        return <FaTelegram className={iconClass} />;
      case 'spotify':
        return <FaSpotify className={iconClass} />;
      case 'discord':
        return <FaDiscord className={iconClass} />;
      case 'pinterest':
        return <FaPinterest className={iconClass} />;
      case 'globe':
        return <FaGlobe className={iconClass} />;
      case 'soundcloud':
        return <FaSoundcloud className={iconClass} />;
      default:
        return <FaGlobe className={iconClass} />;
    }
  };

  const activePlatform =
    platforms.find((p) => p.id === activeTab) || platforms[0];

  // Why Choose Us features data
  const features = [
    {
      icon: FaDollarSign,
      title: 'Unmatched Affordability',
      description:
        'At SMMDOC, we take pride in offering the most budget-friendly SMM services. Our competitive prices ensure that businesses of all sizes can get high-quality social media marketing solutions without exceeding their budgets. We are dedicated to delivering exceptional value without compromising quality, making us the perfect choice for cost-conscious yet ambitious brands.',
    },
    {
      icon: FaBullseye,
      title: 'Customized Strategies',
      description:
        'Every brand is unique, and so should its social media strategy. We at SMMDOC specialize in creating tailor-made strategies that match your business goals and target audience. Our personalized approach ensures that each campaign we run is as unique as your brand, maximizing impact and engagement.',
    },
    {
      icon: FaTrophy,
      title: 'Proven Results',
      description:
        'Our track record speaks to our expertise. With years of experience and many success stories, SMMDOC has demonstrated its ability to generate substantial results across various social media platforms. Our clients experience heightened visibility, engagement, and conversions, leading to tangible business growth.',
    },
    {
      icon: FaUsers,
      title: 'Expert Team',
      description:
        'Our team of social media experts is the backbone of our success. With deep insights into the ever-evolving digital landscape, they bring much knowledge and innovation. Their expertise ensures that your social media presence is vibrant and strategically aligned with the latest trends and best practices.',
    },
    {
      icon: FaCogs,
      title: 'Comprehensive Service Range',
      description:
        'SMMDOC provides a wide array of services encompassing major social media platforms such as Facebook, Instagram, Twitter, YouTube, and more. This comprehensive service spectrum ensures a one-stop solution for all your social media marketing needs, promoting consistency and convenience.',
    },
    {
      icon: FaHeadset,
      title: 'Dedicated Customer Support',
      description:
        'We focus on creating long-term relationships with our clients. Our committed customer support team is always ready to assist, ensuring your experience with us is smooth and satisfactory. We value your feedback and are committed to continuous improvement, making us a reliable partner in your social media journey.',
    },
  ];

  // Component to render when user is authenticated
  const AuthenticatedUserContent = () => (
    <div
      className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full -mt-[30px] lg:-mt-[0px] pt-[30px] p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          {isAdmin ? (
            <FaUserShield className="w-8 h-8 text-white" />
          ) : (
            <FaUser className="w-8 h-8 text-white" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Welcome back,{' '}
          <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
            {session?.user?.username || 
             session?.user?.email?.split('@')[0] || 
             session?.user?.name || 
             'User'}!
          </span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-200">
          {isAdmin 
            ? 'Ready to manage the platform?' 
            : 'Ready to boost your social media presence?'}
        </p>
        
        <div className="space-y-4">
          {isAdmin ? (
            <Link
              href="/admin"
              className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <FaHome className="w-5 h-5" />
              Go to Admin Panel
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <FaTachometerAlt className="w-5 h-5" />
              Go to Dashboard
            </Link>
          )}
          
          {!isAdmin && (
            <Link
              href="/services"
              className="w-full bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600/50 hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <FaBriefcase className="w-5 h-5" />
              Browse Services
            </Link>
          )}
        </div>

        {/* Quick Stats for Authenticated User */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)]">
                {/* You can replace these with actual user stats */}
                {isAdmin ? '1,000+' : '12'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {isAdmin ? 'Total Orders' : 'Active Orders'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)]">
                {isAdmin ? '500+' : '$45.80'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {isAdmin ? 'Active Users' : 'Account Balance'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state component
  const LoadingContent = () => (
    <div
      className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
      data-aos="fade-down"
      data-aos-duration="500"
    >
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-auto mb-6"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );

  return (
    <>
      {/* HERO SECTION */}
      <section className="flex justify-center items-center pt-[60px] pb-[30px] lg:pt-[120px] lg:pb-[60px] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className={`
            ${isAuthenticated ? 'flex flex-col-reverse' : 'grid grid-cols-1'}
            lg:grid lg:grid-cols-2 gap-8 2xl:gap-x-20 items-center
          `}>
            {/* Left side */}
            <div>
              <div className="text-left">
                <h1
                  className="text-4xl lg:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight transition-colors duration-200"
                  data-aos="fade-down"
                  data-aos-duration="500"
                >
                  <span className="text-[var(--primary)] dark:text-[var(--secondary)]">
                    SMMDOC - #1
                  </span>{' '}
                  <br />
                  Cheap SMM Panel
                </h1>
                <p
                  className="text-lg mb-6 leading-7 text-gray-600 dark:text-gray-300 lg:w-full mx-auto transition-colors duration-200 text-justify"
                  data-aos="fade-down"
                  data-aos-duration="1000"
                >
                  Boost your online presence today with our Cheap SMM Panel –
                  the ultimate solution for social media success! SMMDOC is a
                  SMM Panel with more then 3 years on the market and 1,000+
                  Orders processed successfully until now!
                </p>
                
                {/* Conditional CTA button based on authentication */}
                {!isAuthenticated && !isLoading && (
                  <Link
                    href="/sign-up"
                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-7 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center space-x-2 hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 mb-4 hover:-translate-y-1"
                    data-aos="fade-down"
                    data-aos-duration="1000"
                  >
                    <span>Sign Up Now</span>
                  </Link>
                )}

                {isAuthenticated && (
                  <Link
                    href={isAdmin ? "/admin" : "/dashboard"}
                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-7 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center space-x-2 hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 mb-4 hover:-translate-y-1"
                    data-aos="fade-down"
                    data-aos-duration="1000"
                  >
                    {isAdmin ? (
                      <>
                        <FaHome className="w-5 h-5" />
                        <span>Go to Admin Panel</span>
                      </>
                    ) : (
                      <>
                        <FaTachometerAlt className="w-5 h-5" />
                        <span>Go to Dashboard</span>
                      </>
                    )}
                  </Link>
                )}

                {/* Users count section */}
                <div
                  className="flex items-center gap-3 justify-start mt-4"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                >
                  <Image
                    src="/smmgen-users.webp"
                    alt="SMMDOC Users"
                    width={60}
                    height={40}
                    className="rounded"
                  />
                  <div className="text-gray-600 dark:text-gray-300 font-semibold text-base transition-colors duration-200">
                    <span className="text-[var(--primary)] dark:text-[var(--secondary)] font-bold transition-colors duration-200">
                      500
                    </span>
                    + Users using our services.
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Conditional Content */}
            <div className="flex justify-center">
              {isLoading && <LoadingContent />}
              {!isLoading && isAuthenticated && <AuthenticatedUserContent />}
              {!isLoading && !isAuthenticated && (
                <div
                  className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
                  data-aos="fade-down"
                  data-aos-duration="500"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                      Login to{' '}
                      <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                        SMMDOC.
                      </span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                      New Here?{' '}
                      <Link
                        href="/sign-up"
                        className="text-[var(--primary)] dark:text-[var(--secondary)] font-bold hover:underline transition-colors duration-200"
                      >
                        Create an account.
                      </Link>
                    </p>
                  </div>

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    {showTwoFactor ? (
                      <div>
                        <label
                          htmlFor="code"
                          className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200"
                        >
                          2FA Code
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
                          </div>
                          <input
                            type="text"
                            id="code"
                            placeholder="e.g: 123456"
                            disabled={isPending}
                            {...form.register('code')}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                          />
                        </div>
                        {form.formState.errors.code && (
                          <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">
                            {form.formState.errors.code.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200"
                          >
                            Username or Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaUser className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
                            </div>
                            <input
                              type="email"
                              id="email"
                              placeholder="Username or Email"
                              disabled={isPending}
                              {...form.register('email')}
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                            />
                          </div>
                          {form.formState.errors.email && (
                            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">
                              {form.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="password"
                            className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200"
                          >
                            Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
                            </div>
                            <input
                              type="password"
                              id="password"
                              placeholder="Password"
                              disabled={isPending}
                              {...form.register('password')}
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                            />
                          </div>
                          {form.formState.errors.password && (
                            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">
                              {form.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="remember"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 transition-colors duration-200"
                            />
                            <label
                              htmlFor="remember"
                              className="ml-2 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                            >
                              Remember me
                            </label>
                          </div>
                          <Link
                            href="/reset-password"
                            className="text-[var(--primary)] dark:text-[var(--secondary)] hover:underline transition-colors duration-200"
                          >
                            Forget Password?
                          </Link>
                        </div>
                      </>
                    )}

                    <FormError message={error || urlError} />
                    <FormSuccess message={success} />

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <ButtonLoader />
                      ) : showTwoFactor ? (
                        'Confirm'
                      ) : (
                        'Login to Dashboard'
                      )}
                    </button>
                  </form>

                  {/* Google Sign-in Button */}
                  {!showTwoFactor && (
                    <div className="mt-4">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                            or
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600/50 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          className="flex-shrink-0"
                        >
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Sign in with Google</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections remain the same */}
      {/* STATISTICS SECTION */}
      <section className="pt-[30px] pb-[30px] lg:pt-[60px] lg:pb-[60px] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {counterData.map((item, index) => (
              <div
                key={index}
                className="text-center group"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay={index * 100}
              >
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:scale-105 group-hover:-translate-y-1">
                  {item.icon}
                </div>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 font-semibold mb-1 transition-colors duration-200">
                  {item.title}
                </p>
                <h4 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  {item.count}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE ARE SECTION */}
      <section
        id="about"
        className="about-us pt-[30px] pb-[30px] lg:pt-[60px] lg:pb-[60px] transition-colors duration-200"
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="default__text__content">
              <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
                About Us
              </h4>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors duration-200">
                Leaders in Social <br />
                Media{' '}
                <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                  Enhancement
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed transition-colors duration-200 text-justify">
                At SMMDOC, we revolutionize digital success through our
                budget-friendly and top-notch social media marketing solutions.
                Since our inception in 2021, we have emerged as the preferred
                choice for the most affordable SMM panels, seamlessly combining
                cost-effectiveness with outstanding business expansion
                strategies. Our devoted team is dedicated to delivering
                tailor-made services that save you money and enhance your online
                engagement and presence to the fullest. We specialize in
                transforming your social media channels and provide unparalleled
                growth opportunities on platforms such as Facebook, YouTube, and
                more. Join us on this journey of affordable excellence, where
                each click brings you closer to your audience and propels you a
                step ahead in the competitive digital world.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                <span>Learn More</span>
                <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Image */}
            <div className="default_image text-center lg:text-right">
              <div className="relative group">
                <Image
                  src="/cheapest-smmpanel-in-bangladesh.webp"
                  alt="Cheapest SMM Panel in Bangladesh"
                  width={600}
                  height={500}
                  className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg transition-all duration-300"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM SERVICES SECTION */}
      <section
        id="our_services"
        className="pt-[30px] pb-[30px] lg:pt-[60px] lg:pb-[60px] transition-colors duration-200"
      >
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="lg:text-center text-left mb-6">
            <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
              Our Services
            </h4>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Comprehensive{' '}
              <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                SMM
              </span>{' '}
              Solutions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200">
              Our budget-friendly and top-notch social media marketing solutions.
            </p>
          </div>

          {/* Platform Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-full overflow-x-auto transition-all duration-200">
              <div className="flex flex-wrap justify-center gap-2 min-w-max">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setActiveTab(platform.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 whitespace-nowrap ${
                      activeTab === platform.id
                        ? 'bg-white dark:bg-gray-700/70 border-[var(--primary)] dark:border-[var(--secondary)] shadow-lg text-gray-900 dark:text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-[var(--primary)] dark:hover:border-[var(--secondary)] hover:shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    {renderIcon(platform.icon)}
                    {activeTab === platform.id && (
                      <span className="font-semibold text-sm">
                        {platform.name}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 items-center mt-8">
            <div>
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                {activePlatform.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-justify transition-colors duration-200">
                {activePlatform.description}
              </p>
              <Link
                href="/services"
                className="inline-block bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 rounded-lg hover:from-[#4F0FD8] hover:to-[#A121E8] hover:shadow-lg dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                Our Services
              </Link>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative group">
                <Image
                  src="/smm-panel-services.webp"
                  alt="SMM Panel Services"
                  width={500}
                  height={400}
                  className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section
        id="whyChooseUs"
        className="py-12 lg:py-24 pb-[60px] lg:pb-[120px] transition-colors duration-200"
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-left lg:text-center mb-6">
            <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
              Why Choose Us?
            </h4>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Unparalleled Quality in <br />
              <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                SMM Service
              </span>{' '}
              and Customer Satisfaction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 h-full hover:-translate-y-1 group"
                >
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200 text-justify">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-0 pb-[30px] lg:pb-[60px] transition-colors duration-200">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] py-20 relative overflow-hidden">
          {/* Optional: Add some decorative elements for dark mode */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-800/10 dark:from-purple-400/5 dark:to-purple-600/5"></div>

          <div className="container mx-auto px-4 text-center max-w-7xl relative z-10">
            <h2
              className="text-3xl lg:text-5xl font-extrabold text-white mb-4"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              How to Order
            </h2>
            <p
              className="text-xl text-purple-100 dark:text-purple-200 mb-16 transition-colors duration-200"
              data-aos="fade-up"
              data-aos-duration="800"
            >
              Our Simple 4-Step Work Order Process
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="container mx-auto px-4 -mt-16 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 relative pb-16 group hover:-translate-y-2 ${index !== 0 ? 'mt-10 lg:mt-0' : ''}`}
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay={index * 150}
              >
                {/* Step Number Badge */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <div className="w-20   h-20 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full flex flex-col items-center justify-center text-white border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-all duration-300">
                    <span className="text-lg font-bold">{step.number}</span>
                    <span className="text-xs font-medium">STEP</span>
                  </div>
                </div>

                {/* Step Icon */}
                <div className="text-center mt-12 mb-6">
                  <div className="mx-auto flex justify-center items-center w-16 h-16 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                </div>

                {/* Step Content */}
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 transition-colors duration-200">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed transition-colors duration-200">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center -mt-8">
            <Link
              href="/sign-up"
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-10 py-4 rounded-lg text-xl font-bold inline-flex items-center hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-duration="800"
            >
              Create An Account
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section
        className="pt-[30px] pb-[30px] lg:pt-[60px] lg:pb-[60px] relative transition-colors duration-200"
      >
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
                Success Stories
              </h4>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                Transforming{' '}
                <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                  Social Media
                </span>{' '}
                Landscapes
              </h2>
            </div>

            {/* Navigation Buttons */}
            <div className="hidden md:flex gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800/70 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 group"
                aria-label="Previous testimonial"
              >
                <FaChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[var(--primary)] dark:group-hover:text-[var(--secondary)] transition-colors duration-200" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800/70 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 group"
                aria-label="Next testimonial"
              >
                <FaChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[var(--primary)] dark:group-hover:text-[var(--secondary)] transition-colors duration-200" />
              </button>
            </div>
          </div>

          {/* Testimonials Slider */}
          <div className="overflow-hidden mb-8 -mx-4">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentSlide * (isMobile ? 100 : (100 / itemsPerPage))
                }%)`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full md:w-1/3 flex-shrink-0 px-4">
                  <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-80 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-justify text-sm leading-relaxed line-clamp-6 transition-colors duration-200">
                        "{testimonial.content}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-0 transition-colors duration-200">
                          {testimonial.name}
                        </h4>
                        <small className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-200">
                          ~{testimonial.position} of {testimonial.company}
                        </small>
                      </div>

                      <div className="flex items-center gap-1 bg-white dark:bg-gray-700/50 shadow-sm px-3 py-1 rounded-full border border-gray-100 dark:border-gray-600 transition-all duration-200">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots with Shadow */}
          <div className="flex justify-center mt-8 gap-3">
            {Array.from({ length: maxSlide + 1 }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'bg-[var(--primary)] dark:bg-[var(--secondary)] scale-110 shadow-lg shadow-[var(--primary)]/40 dark:shadow-[var(--secondary)]/40'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 shadow-md hover:shadow-lg hover:scale-105'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden justify-center gap-4 mt-6">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800/70 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 group"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[var(--primary)] dark:group-hover:text-[var(--secondary)] transition-colors duration-200" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800/70 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 group"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[var(--primary)] dark:group-hover:text-[var(--secondary)] transition-colors duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section
        className="pt-[30px] lg:pt-[60px] pb-[120px] transition-colors duration-200"
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-left lg:text-center mb-6">
            <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
              FAQ's
            </h4>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              People Also Asked to{' '}
              <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                SMMDOC
              </span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {faqData.map((faq) => (
                <div
                  key={`faq-${faq.id}`}
                  className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300"
                >
                  <button
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200 rounded-lg focus:outline-none"
                    onClick={() => toggleItem(faq.id)}
                  >
                    <span className="font-medium text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <div
                      className={`transform transition-transform duration-200 ${
                        openItems.includes(faq.id) ? 'rotate-180' : 'rotate-0'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openItems.includes(faq.id)
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 transition-colors duration-200">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;