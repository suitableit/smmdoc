import Image from 'next/image';
import greatQuality from '../../public/great-quality.png';
import paymentMethods from '../../public/payment-methods.png';
import shockingPrice from '../../public/shoking-prices.png';
import unbelievablePrice from '../../public/unbelievable-prices.png';

const WhyChooseUs = () => {
  return (
    <section className="main-container py-20 lg:py-28 w-full">
      {/* titles */}
      <div className="w-full text-center">
        <button
          className="bg-blue text-white dark:text-gray-300 px-8 py-2 rounded-md uppercase"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          Why Choose Us
        </button>
        <h3
          className="text-3xl lg:text-4xl lg:w-7/12 lg:mx-auto mt-4 dark:text-gray-300"
          data-aos="fade-down"
          data-aos-duration="1000"
        >
          We are help dominate social media with the largest social media panel
        </h3>
      </div>
      {/* cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-8 lg:mt-12 gap-8 text-center">
        {/* card 1 */}
        <div
          className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md p-5 flex flex-col justify-center items-center gap-y-4"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <Image
            src={greatQuality}
            alt="Great Quality"
            placeholder="blur"
            width={200}
            height={200}
          />
          <h4 className="text-center text-2xl font-medium">Great Quality</h4>
          <p className="text-center">
            You will be satisfied with SMM services we provide.
          </p>
        </div>
        {/* card 2 */}
        <div
          className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md p-5 flex flex-col justify-center items-center gap-y-6"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <Image
            src={paymentMethods}
            alt="Payment Methods"
            placeholder="blur"
            width={200}
            height={200}
          />
          <h4 className="text-center text-2xl font-medium">
            Many payment methods
          </h4>
          <p className="text-center">
            Enjoy a fantastic selection of payment methods that we offer.
          </p>
        </div>
        {/* card 3 */}
        <div
          className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md p-5 flex flex-col justify-center items-center gap-y-6"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <Image
            src={shockingPrice}
            alt="Shocking Price"
            placeholder="blur"
            width={200}
            height={200}
          />
          <h4 className="text-center text-2xl font-medium">Shoking prices</h4>
          <p className="text-center">
            You will be satisfied with how cheap our services are.
          </p>
        </div>
        {/* card 4 */}
        <div
          className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md p-5 flex flex-col justify-center items-center gap-y-6"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <Image
            src={unbelievablePrice}
            alt="Unbelievable Price"
            placeholder="blur"
            width={200}
            height={200}
          />
          <h4 className="text-center text-2xl font-medium">
            Unbelievable Prices
          </h4>
          <p className="text-center">
            Our prices most reasonable in the market, starting from at $0.001.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
