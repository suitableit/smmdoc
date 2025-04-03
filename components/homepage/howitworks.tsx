import { BsArrowRight } from 'react-icons/bs';

const HowItWorks = () => {
  return (
    <section className="main-container py-20 lg:py-28 w-full">
      {/* titles */}
      <div className="w-full text-center">
        <h3
          className="text-3xl lg:text-4xl lg:w-7/12 lg:mx-auto mt-4 font-semibold dark:text-gray-300"
          data-aos="fade-down"
          data-aos-duration="1500"
        >
          How It Works?
        </h3>
        <p
          className="text-xl mt-3 dark:text-gray-400"
          data-aos="fade-down"
          data-aos-duration="2000"
        >
          By following the processes below you can make any order you want.
        </p>
      </div>
      {/* steps */}
      <div className="mx-auto py-12 px-4 mt-2 lg:mt-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gapx-x-8 gap-y-12 lg:gap-4">
          {/* Step 1 */}
          <div
            className="flex flex-col items-center text-center group transition-all duration-300"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <div className="size-24 rounded-full border-4 border-dotted border-blue-900 flex items-center justify-center mb-4 group-hover:spinner relative">
              <span className="text-3xl font-medium text-blue-800">1</span>
            </div>
            <h3 className="text-2xl dark:text-gray-400 font-semibold mb-2">
              Register & log in
            </h3>
            <p className="text-md text-gray-700 dark:text-gray-500 max-w-xs">
              Creating an account is the first step, then you need to log in.
            </p>
          </div>

          {/* Arrow 1 */}
          <div className="hidden lg:block text-5xl transition-transform duration-300 group-hover:translate-x-2">
            <BsArrowRight />
          </div>

          {/* Step 2 */}
          <div
            className="flex flex-col items-center text-center group transition-all duration-300"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <div className="size-24 rounded-full border-4 border-dotted border-blue-900 flex items-center justify-center mb-4 group-hover:spinner">
              <span className="text-3xl font-medium text-blue-800">2</span>
            </div>
            <h3 className="text-2xl dark:text-gray-400 font-semibold mb-2">
              Add funds
            </h3>
            <p className="text-md text-gray-700 dark:text-gray-500 max-w-xs">
              Next, pick a payment method and add funds to your account.
            </p>
          </div>

          {/* Arrow 2 */}
          <div className="hidden lg:block text-5xl transition-transform duration-300 group-hover:translate-x-2">
            <BsArrowRight />
          </div>

          {/* Step 3 */}
          <div
            className="flex flex-col items-center text-center group transition-all duration-300"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <div className="size-24 rounded-full border-4 border-dotted border-blue-900 flex items-center justify-center mb-4 group-hover:spinner">
              <span className="text-3xl font-medium text-blue-800">3</span>
            </div>
            <h3 className="text-2xl dark:text-gray-400 font-semibold mb-2">
              Select a service
            </h3>
            <p className="text-md text-gray-700 dark:text-gray-500 max-w-xs">
              Select the services you want and get ready to receive more
              publicity.
            </p>
          </div>

          {/* Arrow 3 */}
          <div className="hidden lg:block text-5xl transition-transform duration-300 group-hover:translate-x-2">
            <BsArrowRight />
          </div>

          {/* Step 4 */}
          <div
            className="flex flex-col items-center text-center group transition-all duration-300"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <div className="size-24 rounded-full border-4 border-dotted border-blue-900 flex items-center justify-center mb-4 group-hover:spinner">
              <span className="text-3xl font-medium text-blue-800">4</span>
            </div>
            <h3 className="text-2xl dark:text-gray-400 font-semibold mb-2">
              Enjoy popularity
            </h3>
            <p className="text-md text-gray-700 dark:text-gray-500 max-w-xs">
              You can enjoy incredible results when your order is complete.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
