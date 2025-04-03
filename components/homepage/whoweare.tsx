import Image from 'next/image';
import Link from 'next/link';
import whoweareImage from '../../public/who-we-are.png';

const WhoWeAre = () => {
  return (
    <section className="main-container py-20 lg:py-28 w-full grid grid-cols-1 lg:grid-cols-2 gap-y-4">
      {/* image */}
      <Image
        src={whoweareImage}
        alt="Who We Are"
        placeholder="blur"
        width={500}
        height={500}
        className="rounded-lg"
        data-aos="fade-down"
        data-aos-duration="1500"
      />
      {/* card */}
      <div
        className="bg-[#f6f9ff] dark:bg-gray-500 dark:text-gray-300 rounded p-6 flex flex-col"
        data-aos="fade-down"
        data-aos-duration="1500"
      >
        <p className="uppercase text-md text-blue dark:text-gray-300 dark:font-semibold">
          Who we are
        </p>
        <h4 className="text-2xl lg:text-3xl lg:font-medium mt-2 mb-4 dark:text-gray-200">
          What We Offer For Your Succes Brand
        </h4>
        <p className="leading-7 dark:text-gray-300">
          We are active for support only 24 hours a day and seven times a week
          with all of your demands and services around the day. Dont go anywhere
          else. We are here ready to serve you and help you with all of your SMM
          needs. Users or Clients with SMM orders and in need of CHEAP SMM
          services are more then welcome in our SMM PANEL.
        </p>
        <Link
          href="/sign-in"
          className="bg-blue text-white w-7/12 2xl:w-4/12 px-2.5 py-2 lg:p-2.5 mt-6 rounded-md text-md font-medium flex items-center justify-center space-x-2"
        >
          <span className="dark:text-gray-300">VIEW SERVICES</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M12 19l7-7-7-7" />
            <path d="M5 12h14" />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default WhoWeAre;
