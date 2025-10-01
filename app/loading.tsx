// import loader from '@/assets/loader.gif';
// import Image from 'next/image';
const Loading = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* <Image
        src={loader}
        alt="Loading..."
        height={160}
        width={160}
        priority={true}
      /> */}
    </div>
  );
};

export default Loading;
