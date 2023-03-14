import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const attendanceAdapter = createEntityAdapter({})

const initialState = attendanceAdapter.getInitialState()

export const attendanceApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAttendance: builder.query({
            query: () => ({
                url: '/attendance',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedAttendance = responseData.map(attendance => {
                    attendance.id = attendance._id
                    return attendance
                });
                return attendanceAdapter.setAll(initialState, loadedAttendance)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Attendance', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Attendance', id }))
                    ]
                } else return [{ type: 'Attendance', id: 'LIST' }]
            }
        }),
        addNewAttendance: builder.mutation({
            query: initialAttendanceData => ({
                url: '/attendance',
                method: 'POST',
                body: {
                    ...initialAttendanceData,
                }
            }),
            invalidatesTags: [
                { type: 'Attendance', id: "LIST" }
            ]
        }),
        updateAttendance: builder.mutation({
            query: initialAttendanceData => ({
                url: '/attendance',
                method: 'PATCH',
                body: {
                    ...initialAttendanceData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Attendance', id: arg.id }
            ]
        }),
        deleteAttendance: builder.mutation({
            query: ({ id }) => ({
                url: `/attendance`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Attendance', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetAttendanceQuery,
    useAddNewAttendanceMutation,
    useUpdateAttendanceMutation,
    useDeleteAttendanceMutation,
} = attendanceApiSlice

// returns the query result object
export const selectAttendanceResult = attendanceApiSlice.endpoints.getAttendance.select()

// creates memoized selector
const selectAttendanceData = createSelector(
    selectAttendanceResult,
    attendanceResult => attendanceResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllAttendance,
    selectById: selectAttendanceById,
    selectIds: selectAttendanceIds
    // Pass in a selector that returns the attendance slice of state
} = attendanceAdapter.getSelectors(state => selectAttendanceData(state) ?? initialState)

