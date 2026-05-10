"use client";

import { useGetAuthUserQuery, useUpdateManagerSettingsMutation } from '@/state/api';
import React from 'react'
import SettingsForm from '@/components/SettingsForm';

const ManagerSettings = () => {
    const [updateManager] = useUpdateManagerSettingsMutation();
    const { data: authUser, isLoading, isError, error } = useGetAuthUserQuery();

    if (isLoading) {
        return <div className="pt-8 pb-5 px-8">Loading settings...</div>;
    }

    if (isError) {
        return (
            <div className="pt-8 pb-5 px-8 text-red-600">
                Failed to load settings. {JSON.stringify(error)}
            </div>
        );
    }

    if (!authUser || !authUser.userInfo) {
        return <div className="pt-8 pb-5 px-8">No user profile found.</div>;
    }

    const initialData = {
        name: authUser.userInfo?.name ?? "",
        email: authUser.userInfo?.email ?? "",
        phoneNumber: authUser.userInfo?.phoneNumber ?? "",
    };

    const handleSubmit = async (data: typeof initialData) => {
        await updateManager({
            cognitoId: authUser.cognitoInfo?.userId,
            ...data,
        });
        };

  return (
    <SettingsForm
        initialData={initialData}
        onSubmit={handleSubmit}
        userType="manager"
    />
    );
};
  


export default ManagerSettings