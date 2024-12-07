import React, { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts'
import { axiosInstanceVendor } from '@/config/api/axiosInstance'
import { showToastMessage } from '@/validations/common/toast'
import { ApexOptions } from 'apexcharts'
import SidebarVendor from '@/layout/vendor/SidebarProfileVendor'



const getCategories = (date: string) => {
    const currentYear = new Date().getFullYear();

    if (date === "month") {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    } else if (date === "week") {
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    } else {
        return Array.from({ length: 5 }, (_, index) => `${currentYear - 4 + index}`);
    }
}

interface ChartOneState {
    series: {
        name: string;
        data: number[];
    }[];
}


const RevenueChartVendor: React.FC = () => {
    const [date, setDate] = useState<string>("week")
    const [monthlyData, setMonthlyData] = useState<number[]>([])
    const [chartData, setChartData] = useState<ApexOptions>({
        chart: {
            background: "#fff",
            foreColor: "#000",
        },
        series: [],
        colors: ["#000"],
    });
    const [state, setState] = useState<ChartOneState>({
        series: [
            {
                name: "Product One",
                data: monthlyData,
            },
        ],

    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstanceVendor.get(`/revenue?date=${date}`)
                const revenueData = response.data.revenue;
                if (Array.isArray(revenueData)) {
                    setMonthlyData(revenueData)
                    setState({
                        series: [
                            {
                                name: 'Revenue',
                                data: revenueData
                            },
                        ],
                    });
                } else {
                    showToastMessage('Invalid data format', 'error')
                }
            } catch (error) {
                console.error('Invalid data', error)
            }
        }

        setChartData((prevData) => ({
            ...prevData,
            xaxis: {
                ...prevData.xaxis,
                categories: getCategories(date)
            }
        }))
        fetchData()
    }, [date])


    return (
        <div className='flex'>
            <div>
                <SidebarVendor/>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full border ">
                <div className="flex justify-between items-center m-6 ">
                    <h2 className="text-xl font-semibold text-gray-800">Total Revenue</h2>
                    <div className="flex space-x-2">
                        {['week', 'month', 'year'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setDate(period)}
                                className={`px-3 py-1 text-sm rounded ${date === period
                                    ? 'bg-black text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <ReactApexChart
                    options={chartData}
                    series={state.series}
                    type="area"
                    height={350}
                />
            </div>
        </div>

    )
}

export default RevenueChartVendor

