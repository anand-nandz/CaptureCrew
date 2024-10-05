import { Hourglass } from 'react-loader-spinner';

const Loader = () => {
  return (
    <div
      className="flex h-screen items-center justify-center bg-white"
      
    >
      
      <div className="flex items-center justify-center h-40 w-40 rounded-full border-4 border-black">
        <Hourglass
          visible={true}
          height="80"
          width="80"
          ariaLabel="hourglass-loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={['#000000', '#000000']} 
        />
      </div>
    </div>
  );
};

export default Loader;
