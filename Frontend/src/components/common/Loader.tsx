import { Hourglass } from 'react-loader-spinner';

const Loader  : React.FC = () => {
  return (
    <div
      className="flex h-screen items-center flex-col justify-center bg-white">
      
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
      <h1 className=" mt-4 text-3xl font-bold text-black">CaptureCrew</h1>
    </div>
  );
};

export default Loader;
