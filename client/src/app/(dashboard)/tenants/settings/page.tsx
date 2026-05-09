"use client";

import { useGetAuthUserQuery, useUpdateTenantSettingsMutation } from '@/state/api';
import React from 'react'
import SettingsForm from '@/components/SettingsForm';

const TenantSettings = () => {
    const [updateTenant] = useUpdateTenantSettingsMutation();
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
        await updateTenant({
            cognitoId: authUser.cognitoInfo?.userId,
            ...data,
        });
        };

  return (
    <SettingsForm
        initialData={initialData}
        onSubmit={handleSubmit}
        userType="tenant"
    />
    );
};
  


export default TenantSettings