'use client';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import testimonal1 from '../../public/testimonial-1.jpg';
import testimonal2 from '../../public/testimonial-2.jpg';
import testimonal3 from '../../public/testimonial-3.jpg';
import testimonal4 from '../../public/testimonial-4.jpg';
import testimonal5 from '../../public/testimonial-5.jpg';

const testimonials = [
  {
    name: 'John Smith',
    title: 'YouTuber',
    image: testimonal1,
    feedback:
      "After trying several websites who claim to have 'fast delivery', I'm glad I finally found this service. They literally started delivering 5 seconds after my payment!",
  },
  {
    name: 'Jane Doe',
    title: 'Blogger',
    image: testimonal2,
    feedback:
      'After trying several websites who claim to have fast delivery, Im glad I finally found this service. They literally started delivering 5 seconds after my payment',
  },
  {
    name: 'Michael Lee',
    title: 'Designer',
    image: testimonal3,
    feedback:
      'After trying several websites who claim to have fast delivery, Im glad I finally found this service. They literally started delivering 5 seconds after my payment.',
  },
  {
    name: 'Babul Akter',
    title: 'Facebook Influencer',
    image: testimonal4,
    feedback:
      'After trying several websites who claim to have fast delivery, Im glad I finally found this service. They literally started delivering 5 seconds after my payment',
  },
  {
    name: 'Monir Hossain',
    title: 'Designer',
    image: testimonal5,
    feedback:
      'After trying several websites who claim to have fast delivery, Im glad I finally found this service. They literally started delivering 5 seconds after my payment',
  },
];

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const WhatPeopleSays = () => {
  return (
    <section className="main-container py-20 lg:py-28 w-full overflow-x-hidden">
      {/* titles */}
      <div className="w-full text-center">
        <h3
          className="text-3xl lg:text-4xl lg:w-7/12 lg:mx-auto mt-4 font-semibold dark:text-gray-300"
          data-aos="fade-down"
          data-aos-duration="1500"
        >
          What People Say About Us?
        </h3>
        <p
          className="text-xl mt-3 w-full md:w-10/12 lg:w-8/12 mx-auto dark:text-gray-400"
          data-aos="fade-down"
          data-aos-duration="2000"
        >
          Our service has an extensive customer roster built on years’ worth of
          trust. Read what our buyers think about our range of service.
        </p>
        {/* testimonials */}
        <div className=" mt-6 lg:mt-12">
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="px-6 py-8"
                data-aos="fade-down"
                data-aos-duration="1500"
              >
                <div className="flex justify-center mb-6">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full border-2 border-gray-300"
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-500 text-lg italic mb-4">
                  {testimonial.feedback}
                </p>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-500">
                  {testimonial.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-600">
                  {testimonial.title}
                </p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default WhatPeopleSays;
