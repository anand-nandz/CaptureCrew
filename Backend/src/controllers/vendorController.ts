import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import { VendorRequest } from "../types/vendorTypes";
import jwt from 'jsonwebtoken';
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";
import { VendorSession } from "../interfaces/commonInterfaces";
import HTTP_statusCode from "../enums/httpStatusCode";
import { DateRangeQuery } from "../utils/extraUtils";

interface OTP {
    otp: string | undefined;
    email: string;
    otpSetTimestamp: number | undefined
}

declare module 'express-session' {
    interface Session {
        vendor: VendorSession,
        otp: OTP | undefined
    }
}


class VendorController {

    private vendorService: IVendorService;

    constructor(vendorService: IVendorService) {
        this.vendorService = vendorService;
    }

    VendorSignUp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, name, password, city, contactinfo, companyName, about } = req.body;

            const vendorData = await this.vendorService.registerVendor({
                email,
                name,
                password,
                city,
                contactinfo,
                companyName,
                about,
            });

            req.session.vendor = vendorData
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    throw new CustomError('Error saving session', HTTP_statusCode.InternalServerError);
                }
                res.status(HTTP_statusCode.OK).json({
                    message: `OTP send to Email for Verification`,
                    email: email,
                    otpExpiry: vendorData.otpExpiry,
                    resendAvailableAt: vendorData.resendTimer
                });
            })


        } catch (error) {
            handleError(res, error, 'VendorSignUp')
        }
    }

    verifyOTP = async(req: Request, res: Response): Promise<void> =>{
        try {
            const otp = req.body.otp
            const { name, email, city, password, contactinfo, otpCode, companyName, about, otpExpiry } = req.session.vendor

            if (otp !== otpCode) {
                throw new CustomError('Invalid OTP', HTTP_statusCode.BadRequest)
            }
            const currentTime = Date.now();
            if (currentTime > otpExpiry) {
                throw new CustomError('OTP has expired. Please request a new one.', HTTP_statusCode.BadRequest);
            }

            if (otp === otpCode) {
                const { vendor } = await this.vendorService.signup(
                    email,
                    password,
                    name,
                    contactinfo,
                    city,
                    companyName,
                    about
                )
                res.status(201).json({ vendor, message: 'Account created successfully!' })
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
        }
    }


    VendorLogin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            const { token, refreshToken, vendor, message } = await this.vendorService.login(email, password);

            res.cookie('jwtToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.status(HTTP_statusCode.OK).json({ token, vendor, message })
        } catch (error) {
            handleError(res, error, 'VendorLogin')
        }
    }

    VendorLogout = async (req: Request, res: Response): Promise<void> => {
        try {
            res.clearCookie('jwtToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(HTTP_statusCode.OK).json({ message: 'Vendor Logged out Succesfully' })
        } catch (error) {
            handleError(res, error, 'VendorLogout')
        }
    }

    CreateRefreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshToken = req.cookies.jwtToken;

            if (!refreshToken) {
                throw new CustomError('No refresh token provided', 401);
            }
            try {

                const newAccessToken = await this.vendorService.create_RefreshToken(refreshToken);

                res.status(HTTP_statusCode.OK).json({ token: newAccessToken });
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    res.clearCookie('refreshToken');
                    throw new CustomError('Refresh token expired', 401);
                }
                throw error;
            }

        } catch (error) {
            handleError(res, error, 'CreateRefreshToken')
        }
    }

    checkBlockStatus = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const vendorId = req.vendor?._id
            if (!vendorId) {
                throw new CustomError('Vendor not found', 404)
            }
            const vendor = await this.vendorService.checkBlock(vendorId.toString())
            if (!vendor) {
                throw new CustomError('Vendor not found', 404)
            }

            if (!vendor.isActive) {
                res.status(403).json({
                    message: 'Blocked by Admin',
                    isBlocked: true
                })
                return
            }
            res.status(HTTP_statusCode.OK).json({
                isBlocked: false
            });
        } catch (error) {
            handleError(res, error, 'checkBlockStatus');
        }
    }

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body
            if (!email) {
                throw new CustomError('Email is required', HTTP_statusCode.BadRequest);
            }

            await this.vendorService.handleForgotPassword(email)
            res.status(HTTP_statusCode.OK).json({ message: 'Password reset link sent to your email' });

        } catch (error) {
            handleError(res, error, 'forgotPassword')
        }
    }

    changeForgotPassword = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.params;
        const { password } = req.body;
        try {
            if (!token) {
                throw new CustomError('Session Expired', HTTP_statusCode.BadRequest)
            } else if (!password) {
                throw new CustomError("Password required", HTTP_statusCode.BadRequest)
            }

            await this.vendorService.newPasswordChange(token, password)

            res.status(HTTP_statusCode.OK).json({ message: 'Password Reset Successfull' })

        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

    validateResetToken = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.params;

        try {
            if (!token) {
                throw new CustomError('Token is required', HTTP_statusCode.BadRequest);
            }
            const isValid = await this.vendorService.validateToken(token);
            res.status(HTTP_statusCode.OK).json({ isValid });
        } catch (error) {
            res.status(HTTP_statusCode.BadRequest).json({ message: (error as Error).message });
        }
    }

    getVendorProfile = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Vendor ID is missing' });
                return;
            }

            const result = await this.vendorService.getVendorProfileService(vendorId.toString())
            res.status(HTTP_statusCode.OK).json(result);
        } catch (error) {
            handleError(res, error, 'getVendor');
        }
    }

    updateProfile = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const { name, contactinfo, companyName, city, about } = req.body
            const vendorId = req.vendor?._id;

            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Vendor ID is missing' });
                return;
            }
            if ((!name && !contactinfo && !companyName && !city && !about && !req.file) || (name === '' && contactinfo === '' && companyName === '' && city === '' && about === '' && !req.file)) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'At least one field (name or contact info) is required' });
                return;
            }

            const vendor = await this.vendorService.updateProfileService(name, contactinfo, companyName, city, about, req.file || null, vendorId)
            res.status(201).json(vendor);
        } catch (error) {
            handleError(res, error, 'updateProfile')
        }
    }


    getPackages = async (req: VendorRequest, res: Response): Promise<void> => {
        try {

            if (!req.vendor?._id) {
                throw new CustomError('Vendor not found in request', 401);
            }

            const vendorId = req.vendor?._id;
            const result = await this.vendorService.getPackages(vendorId)

            res.status(HTTP_statusCode.OK).json({
                status: 'success',
                data: {
                    packages: result
                }
            });

        } catch (error) {
            handleError(res, error, 'getPackages')
        }
    }

    createPackage = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const {
                serviceType,
                price,
                description,
                duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions
            } = req.body

            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'VendorId is missing' });
                return
            }


            const createPackage = await this.vendorService.addNewPkg(
                serviceType,
                price,
                description,
                duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions,
                vendorId
            )

            res.status(201).json(createPackage)

        } catch (error) {
            handleError(res, error, 'createPackage')
        }
    }


    updatePackge = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const packageId = req.params.id;
            const vendorId = req.vendor?._id;

            const {
                serviceType,
                price,
                description,
                duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions
            } = req.body

            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Vendor ID is missing' });
                return;
            }

            if (!packageId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Package ID is missing' });
                return;
            }

            const updatePackage = await this.vendorService.updatePkg(
                vendorId,
                packageId,
                serviceType,
                price,
                description,
                duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions
            )

            res.status(HTTP_statusCode.OK).json({ package: updatePackage })

        } catch (error) {
            handleError(res, error, 'updatePackge')
        }
    }


    getVendorWithAll = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const vendorId = req.vendor?._id
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Vendor ID is missing' });
                return;
            }

            const result = await this.vendorService.getAllDetails(vendorId.toString())

            res.status(HTTP_statusCode.OK).json({ vendor: result })

        } catch (error) {
            handleError(res, error, 'getVendorWithAll')
        }
    }

    showUnavailableDates = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(401).json({ success: false, message: 'VendorId is missing' })
                return
            }

            const result = await this.vendorService.showDates(vendorId.toString())

            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: 'Data fetched succesfully',
                result
            })
        } catch (error) {
            handleError(res, error, 'showUnavailableDates')
        }
    }

    addUnavailableDates = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const vendorId = req.vendor?._id;
            const { dates } = req.body;

            if (!vendorId) {
                res.status(401).json({ success: false, message: 'VendorId is missing' })
                return
            }

            const result = await this.vendorService.addDates(dates, vendorId.toString())

            if (result.success) {
                res.status(HTTP_statusCode.OK).json({
                    success: true,
                    message: result.message,
                    addedDates: result.addedDates,
                    alreadyBookedDates: result.alreadyBookedDates
                })
            }

            if (result.success === false) {
                res.status(HTTP_statusCode.OK).json({
                    success: false,
                    message: result.message,
                    addedDates: [],
                    alreadyBookedDates: result.alreadyBookedDates
                });
            }
        } catch (error) {
            handleError(res, error, 'addUnavailableDates')
        }
    }


    removeUnavailableDates = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const vendorId = req.vendor?._id;
            const { dates } = req.body;

            if (!vendorId) {
                res.status(401).json({ success: false, message: 'VendorId is missing' });
                return;
            }

            const result = await this.vendorService.removeDates(dates, vendorId.toString());

            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: 'Dates updated successfully',
                updatedDates: result.removedDates
            });
        } catch (error) {
            handleError(res, error, 'removeUnavailableDates');
        }
    }

    changePassword = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const { currentPassword, newPassword } = req.body

            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(401).json({ success: false, message: 'VendorId is missing' });
                return;
            }
            await this.vendorService.passwordCheckVendor(currentPassword, newPassword, vendorId)

            res.status(HTTP_statusCode.OK).json({ message: "Password reset successfully." });
        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

    getVendor = async (req: Request, res: Response): Promise<void> => {
        try {
            const vendorId: string = req.query.vendorId as string
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'VendorId is missing' })
                return
            }

            const data = await this.vendorService.getSingleVendor(vendorId)
            if (!data) {
                res.status(HTTP_statusCode.BadRequest).json({ message: "Vendor not Found." })
            } else {
                res.status(HTTP_statusCode.OK).json({ data: data })
            }
        } catch (error) {
            handleError(res, error, 'getVendor')
        }
    }


    getRevenue = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const { date, startDate, endDate } = req.query as unknown as DateRangeQuery;
            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(401).json({ success: false, message: 'VendorId is missing' });
                return;
            }
            const response = await this.vendorService.getRevenueDetails(date,  vendorId.toString(), startDate, endDate)
            console.log(response, 'ressssssssssssssssss');

            if (response) {
                res.status(HTTP_statusCode.OK).json({ revenue: response })
            }
        } catch (error) {
            handleError(res, error, 'getRevenue')
        }
    }






}

export default VendorController