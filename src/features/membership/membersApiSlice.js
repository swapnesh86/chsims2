import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const membersAdapter = createEntityAdapter({})

const initialState = membersAdapter.getInitialState()

export const membersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMembers: builder.query({
            query: () => ({
                url: '/membership',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedMembers = responseData.map(member => {
                    member.id = member._id
                    return member
                });
                return membersAdapter.setAll(initialState, loadedMembers)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Member', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Member', id }))
                    ]
                } else return [{ type: 'Member', id: 'LIST' }]
            }
        }),
        addNewMember: builder.mutation({
            query: initialMemberData => ({
                url: '/membership',
                method: 'POST',
                body: {
                    ...initialMemberData,
                }
            }),
            invalidatesTags: [
                { type: 'Member', id: "LIST" }
            ]
        }),
        updateMember: builder.mutation({
            query: initialMemberData => ({
                url: '/membership',
                method: 'PATCH',
                body: {
                    ...initialMemberData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Member', id: arg.id }
            ]
        }),
        deleteMember: builder.mutation({
            query: ({ id }) => ({
                url: `/membership`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Member', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetMembersQuery,
    useAddNewMemberMutation,
    useUpdateMemberMutation,
    useDeleteMemberMutation,
} = membersApiSlice

// returns the query result object
export const selectMembersResult = membersApiSlice.endpoints.getMembers.select()

// creates memoized selector
const selectMembersData = createSelector(
    selectMembersResult,
    membersResult => membersResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllMembers,
    selectById: selectMemberById,
    selectIds: selectMemberIds
    // Pass in a selector that returns the members slice of state
} = membersAdapter.getSelectors(state => selectMembersData(state) ?? initialState)
