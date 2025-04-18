import { FaHandshake } from 'react-icons/fa';
import { FcCustomerSupport } from 'react-icons/fc';
import { FiGift } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi2';

const Statistics = () => {
  return (
    <section className="main-container py-12 w-full mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {/* Happy Clients */}
        <div
          className="bg-white dark:bg-gray-500 dark:text-white shadow rounded py-4 px-8 flex justify-center items-center gap-x-3"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <div className="text-blue text-5xl lg:text-4xl">
            <HiUserGroup />
          </div>
          <div>
            <h3 className="text-4xl lg:text-5xl font-semibold text-blue">
              9160
            </h3>
            <p className="text-gray-500 dark:text-gray-300">Happy Clients</p>
          </div>
        </div>

        {/* Total Orders */}
        <div
          className="bg-white dark:bg-gray-500 dark:text-white shadow rounded py-4 px-8 flex justify-center items-center gap-x-3"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <div className="text-red-600 dark:text-red-300 text-5xl lg:text-4xl">
            <FiGift />
          </div>
          <div>
            <h3 className="text-4xl lg:text-5xl font-semibold text-blue">
              570
            </h3>
            <p className="text-gray-500 dark:text-gray-300">Total Orders</p>
          </div>
        </div>

        {/* Hours of Support */}
        <div
          className="bg-white dark:bg-gray-500 dark:text-white shadow rounded py-4 px-8 flex justify-center items-center gap-x-3"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <div className="text-yellow-500 text-5xl lg:text-4xl">
            <FcCustomerSupport />
          </div>
          <div>
            <h3 className="text-4xl lg:text-5xl font-semibold text-blue">
              17035
            </h3>
            <p className="text-gray-500 dark:text-gray-300">Hours Of Support</p>
          </div>
        </div>

        {/* Fast Services */}
        <div
          className="bg-white dark:bg-gray-500 dark:text-white shadow rounded py-4 px-8 flex justify-center items-center gap-x-3"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <div className="text-green-600 text-5xl lg:text-4xl">
            <FaHandshake />
          </div>
          <div>
            <h3 className="text-4xl lg:text-5xl font-semibold text-blue">
              192
            </h3>
            <p className="text-gray-500 dark:text-gray-300">Fast Services</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
