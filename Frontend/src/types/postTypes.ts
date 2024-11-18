import { VendorData } from "./vendorTypes";

export interface PostData {
    _id: string;
    caption: string;
    imageUrl?: string | string[];
    serviceType: ServiceProvided;
    likesCount?: number;
    location?: string;
    status?: PostStatus;
    vendor_id: string 
    vendor: VendorData;
    createdAt: string;
}

export enum ServiceProvided {
    Engagement = 'Engagement',
    Wedding = 'Wedding',
    Birthday = 'Birthday Party',
    OutdoorShoot = "Outdoor Shoot",
}

export enum PostStatus {
    Draft = 'Draft',
    Published = 'Published',
    Archived = 'Archived',
    Blocked = 'Blocked'
}

export interface PostFormData {
    caption: string;
    location: string;
    serviceType: ServiceProvided | '';
    status: PostStatus | '';
    images: (File | null)[];
}
export type PostValidationValue = string | (File | null)[] | null;

export interface PostCardProps {
    post: PostData;
    onShowDetails: (post: PostData) => void;
}

export interface PostModalProps {
    post: PostData | null;
    isOpen: boolean;
    onClose: () => void;
}