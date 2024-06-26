import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosInstance";

const initialState = {
    key: "",
    subscription_id: "",
    isPaymentVerified: false,
    allPayments: {},
    finalMonthSales: {},
    monthlySalesRecord: [10,20,30,40,50,60,70,80,90,110,120]
}

export const getRazorpayId = createAsyncThunk("/razorpay/getId", async () => {
    try {
        const response = await axiosInstance.get("/payments/razorpay-key");
        return response.data;
    } catch (error) {
        toast.error("Failed to load data");
    }
})

export const purchaseCourseBundle = createAsyncThunk("/purchaseCourse", async () => {
    try {
        const response = await axiosInstance.post("/payments/subscribe");
        console.log("PC: ", response);
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

export const verifyUserPayment = createAsyncThunk("/payments/verify", async (data) => {
    try {
        const response = await axiosInstance.post("/payments/verify", {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_subscription_id: data.razorpay_subscription_id,
            razorpay_signature: data.razorpay_signature
        });
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})


export const getPaymentRecord = createAsyncThunk("/payments/record", async () => {
    try {
        const response = axiosInstance.get("/payments?count=100");
        toast.promise(response, {
            loading: "Getting the payment records",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to get payment records"
        })
        return (await response).data;
    } catch (error) {
        toast.error("Operation failed");
    }
})

export const cancelCourseBundle = createAsyncThunk("/payments/unsubscribe", async () => {
    try {
        const response = axiosInstance.post("/payments/unsubscribe");
        toast.promise(response, {
            loading: "Unsubscribing the bundle",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to unsubscribe"
        })
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})
// Not Implemented
export const getFinalMonthSales = createAsyncThunk("/admin/stats/lastmonthsales", async () => {
    try {
        const response = axiosInstance.get("/admin/stats/lastmonthsales");
        toast.promise(response, {
            loading: "loading finalmonth sales...",
            success: (data) => {
                return data?.data?.message;
            },
            error: "failed to fetch finalmonth sales"
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

export const getMonthlySalesRecordsForYearData = createAsyncThunk("/admin/stats/monthlysales", async (year) => {
    try {
        const response = axiosInstance.get(`/admin/stats/monthlysales?year=${year || 2024}`);
        toast.promise(response, {
            loading: `loading ${year}'s sales data`,
            success: (data) => {
                return data?.data?.message;
            },
            error: `failed to fetch ${year}'s sales data`
        })
        return (await response).data;
    }
    catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

const razorpaySlice = createSlice({
    name: "razorpay",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRazorpayId.fulfilled, (state, action) => {
                state.key = action?.payload?.key;
            })
            .addCase(purchaseCourseBundle.fulfilled, (state, action) => {
                state.subscription_id = action?.payload?.subscription_id;
            })
            .addCase(verifyUserPayment.fulfilled, (state, action) => {
                console.log("Verify action is: ", action);
                toast.success(action?.payload?.message);
                state.isPaymentVerified = action?.payload?.success;
            })
            .addCase(verifyUserPayment.rejected, (state, action) => {
                toast.success(action?.payload?.message);
                state.isPaymentVerified = action?.payload?.success;
            })
            .addCase(getPaymentRecord.fulfilled, (state, action) => {
                state.allPayments = action?.payload?.allPayments;
            })
            .addCase(getFinalMonthSales.fulfilled, (state, action) => {
                state.finalMonthSales = action?.payload?.lastMonthSales;
            })
            .addCase(getMonthlySalesRecordsForYearData.fulfilled, (state, action) => {
                state.monthlySalesRecord = action?.payload?.monthlyCompletedSubscriptions;
            })
    }
})

export default razorpaySlice.reducer;