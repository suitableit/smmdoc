import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    id: 1,
    question: 'SMM panels - what are they?',
    answer:
      'An SMM panel is an online shop that you can visit to puchase SMM services at great prices.',
  },
  {
    id: 2,
    question: 'What SMM services can I find on this panel?',
    answer:
      'We sell different types of SMM services — likes, followers, views, etc.',
  },
  {
    id: 3,
    question: 'Are SMM services on your panel safe to buy?',
    answer: 'Sure! Your accounts wont get banned.',
  },
  {
    id: 4,
    question: 'How does a mass order work?',
    answer:
      'Its possible to place multiple orders with different links at once with the help of the mass order feature.',
  },
  {
    id: 5,
    question: 'What does Drip-feed mean?',
    answer:
      'Grow your accounts as fast as you want with the help of Drip-feed. How it works: lets say you want 2000 likes on your post. Instead of getting all 2000 at once, you can get 200 each day for 10 days.',
  },
];

const FAQ = () => {
  return (
    <section className="py-20 lg:py-24 w-full bg-[#faf5ff] dark:bg-gray-500">
      <div className="main-container ">
        {/* titles */}
        <div className="w-full text-center">
          <button
            className="bg-blue text-white px-8 py-2 rounded-md uppercase"
            data-aos="fade-down"
            data-aos-duration="500"
          >
            frequently asked questions
          </button>
          <h3
            className="text-3xl lg:text-4xl lg:w-7/12 lg:mx-auto mt-4 dark:text-gray-300"
            data-aos="fade-down"
            data-aos-duration="1000"
          >
            We answered some of the most frequently asked questions on our
            panel.
          </h3>
        </div>
        {/* faq */}
        <div className="w-full md:w-10/12 lg:w-9/12 mx-auto mt-6 lg:mt-12">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            data-aos="fade-down"
            data-aos-duration="500"
          >
            {faqs?.map(
              (faq: { id: number; question: string; answer: string }) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id.toString()}
                  className="border border-gray-100 py-2 px-3 mb-4 rounded-md bg-white dark:bg-gray-700 dark:border-none shadow"
                >
                  <AccordionTrigger className="text-xl lg:text-2xl dark:text-gray-300">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-lg dark:text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
