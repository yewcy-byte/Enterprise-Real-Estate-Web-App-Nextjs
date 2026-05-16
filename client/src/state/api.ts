import { cleanParams, createNewUserInDatabase } from "@/lib/utils";
import { Tenant, Manager, Property, Lease, Payment } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import type { FilterState } from "@/state";
import { create } from "domain";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) headers.set("Authorization", `Bearer ${idToken}`);
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Managers", "Tenants", "Properties", "PropertyDetails", "leases", "payment"],
  endpoints: (build) => ({
    getAuthUser: build.query<any, void>({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint =
            userRole === "manager"
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;

          let userDetailsResponse = await fetchWithBQ(endpoint);

          if (userDetailsResponse.error && userDetailsResponse.error.status === 404) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ
            );
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
        } catch (error: any) {
          return { error: error.message || "Could not fetch user data" };
        }
      },
    }),

    updateTenantSettings: build.mutation<Tenant, { cognitoId: string } & Partial<Tenant>>({
      query: ({ cognitoId, ...updatedTenantData }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenantData,
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),

    updateManagerSettings: build.mutation<Manager, { cognitoId: string } & Partial<Manager>>({
      query: ({ cognitoId, ...updatedManagerData }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body: updatedManagerData,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
    }),

    getProperties: build.query<Property[], any>({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
    }),

    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (result, error, id) => [{ type: "PropertyDetails", id }],
    }),

    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
    }),

    addFavouriteProperty: build.mutation<Tenant, { cognitoId: string; propertyId: number }>(
      {
        query: ({ cognitoId, propertyId }) => ({
          url: `tenants/${cognitoId}/favorites/${propertyId}`,
          method: "POST",
        }),
        invalidatesTags: (result) => [
          { type: "Tenants", id: result?.id },
          { type: "Properties", id: "LIST" },
        ],
      }
    ),

    removeFavouriteProperty: build.mutation<Tenant, { cognitoId: string; propertyId: number }>(
      {
        query: ({ cognitoId, propertyId }) => ({
          url: `tenants/${cognitoId}/favorites/${propertyId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result) => [
          { type: "Tenants", id: result?.id },
          { type: "Properties", id: "LIST" },
        ],
      }
    ),


//manager related endpoints


    getManagerProperties: build.query<Property[], string>({
      query: (cognitoId) => `managers/${cognitoId}/properties`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
    }),




       createProperty: build.mutation<Property,FormData>(
      {
        query: (newproperty) => ({
          url: "properties",
          method: "POST",
          body: newproperty,
        }),
        invalidatesTags: (result) => [
          { type: "Properties", id: "LIST" },
          { type: "Managers", id: result?.manager?.id },
        ],
      }
    ),




    //lease related endpoints

       getLeases: build.query<Lease[], number>({
      query: () => "leases",
      providesTags: ["leases"],
    }),

         getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `properties/${propertyId}/leases`,
      providesTags: ["leases"],
    }),

       getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: ["payment"],
    }),

    
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useAddFavouritePropertyMutation,
  useRemoveFavouritePropertyMutation,
  useGetCurrentResidencesQuery,
  useGetManagerPropertiesQuery,
  useGetPropertyQuery,
  useGetLeasesQuery,
  useGetPaymentsQuery,
  useGetPropertyLeasesQuery,
  useCreatePropertyMutation
} = api;
