import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  Avatar,
  Switch,
} from "@material-tailwind/react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { UserData } from "../../../types/userTypes";
import { axiosInstanceAdmin } from "../../../config/api/axiosInstance";
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/slices/UserSlice';
import { showToastMessage } from '../../../validations/common/toast';
import { useNavigate } from 'react-router-dom';
import { ADMIN } from '../../../config/constants/constants';
import Swal from 'sweetalert2';
import { AxiosError } from 'axios';
const TABS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
];

const TABLE_HEAD = ["UserName", "Mobile",  "Joined-At",'Google', "Status", "Actions"];

export function SortableTable() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const dispatch = useDispatch()
  const navigate = useNavigate()


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstanceAdmin.get('/users', {
        params: {
          page: currentPage,
          limit: 5,
          search: searchTerm,
          status: activeTab !== 'all' ? activeTab : undefined
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error instanceof AxiosError) {
        showToastMessage(error.message || 'Error loading profile', 'error');
      } else {
        showToastMessage('An unknown error occurred', 'error');
      }
      
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleBlockUnblock = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'block' : 'unblock';
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this user?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#d33' : '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${action} user!`
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstanceAdmin.patch(`/block-unblock?userId=${userId}`);
        showToastMessage(response.data.message, 'success');
        Swal.fire(
          'Success!',
          response.data.message,
          'success'
        );

        if (response.data.processHandle === 'block') {
          dispatch(logout());
          navigate(`${ADMIN.LOGIN}`);
        } else {
          fetchData();
        }
      } catch (error) {
        Swal.fire(
          'Error',
          'Failed to update user status',
          'error'
        );
        console.error('Error while blocking/unblocking user', error);
      }
    }
  };
  return (

    <div className="max-w-7xl mt-5 mx-auto px-4 sm:px-6 lg:px-8">
      <CardHeader floated={false} shadow={false} className="rounded-none p-4 -mt-7 mb-4" placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}>
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
          <Typography
            variant="h5"
            color="blue-gray"
            className="text-center text-2xl lg:text-3xl md:text-2xl sm:text-xl"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}>
            USER MANAGEMENT
          </Typography>

          <div className="w-full lg:w-1/3 md:w-1/2 sm:w-full">
            <Input
              label="Search"
              value={searchTerm}
              onChange={handleSearch}
              crossOrigin={undefined}
              placeholder="Search users..."
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 rounded-xl"
              labelProps={{
                className: "hidden",
              }}
              containerProps={{
                className: "min-w-[100px] relative"
              }}
            />
          </div>
        </div>

        <div className="mt-6">
          <Tabs value={activeTab} className="w-full">
            <TabsHeader
              className="w-full  lg:w-max  md:w-3/4 sm:w-full mx-auto"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}>
              {TABS.map(({ label, value }) => (
                <Tab
                  key={value}
                  value={value}
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onClick={() => handleTabChange(value)}
                  className={`
              ${activeTab === value ? "text-gray-900" : ""}
              text-sm lg:text-base px-8 md:text-sm sm:text-xs 
            `}
                >
                  {label}
                </Tab>
              ))}
            </TabsHeader>
          </Tabs>
        </div>
      </CardHeader>

      <Card className="w-full" placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}>

        <CardBody className="overflow-x-auto px-0" placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}>
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      className="font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-4">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="even:bg-blue-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar src="/images/user.png" alt={user.name} size="sm" placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined} />
                        <div className="flex flex-col">
                          <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}>
                            {user.name}
                          </Typography>
                          <Typography variant="small" color="blue-gray" className="font-normal opacity-70" placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}>
                            {user.email}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}>
                        {user.contactinfo || "Not Added"}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </td>
                    
                    <td className="p-4">
                      <div className="w-max flex justify-center items-center ">
                      {user.isGoogleUser ? (
                        <CheckCircleIcon className="h-5 w-5 flex items-center text-green-500" />
                      ) : (
                        <CancelIcon className="h-5 w-5   text-red-500" />
                      )}
                      </div>
                      
                    </td>
                    <td className="p-4">
                      <div className={`w-max rounded-full ${user.isActive ? 'bg-green-100' : 'bg-red-100'} px-2 py-1`}>
                        <Typography variant="small" className={user.isActive ? 'text-green-700' : 'text-red-700'} placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Typography>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="w-max flex justify-center items-center">
                        <Switch
                        id={`custom-switch-component-${user._id}`}
                        ripple={false}
                          color={user.isActive ? "green" : "red"}
                          checked={user.isActive}
                          onChange={() => handleBlockUnblock(user._id, user.isActive)}
                         
                          crossOrigin={undefined}
                          placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                        className={`h-6 w-12 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                        containerProps={{
                          className: "relative inline-block w-12 h-6",
                        }}
                        circleProps={{
                          className: `absolute left-0.5  w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out ${
                            user.isActive ? 'translate-x-6' : ''
                          }`,
                        }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4" placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}>
          <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}>
            Page {currentPage} of {totalPages}
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="sm"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>


    </div>


  );
}


