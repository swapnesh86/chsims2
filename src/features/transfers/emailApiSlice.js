import { apiSlice } from "../../app/api/apiSlice";

export const emailsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        addNewEmail: builder.mutation({
            query: initialEmailData => ({
                url: '/sendemail',
                method: 'POST',
                body: {
                    ...initialEmailData,
                }
            }),
            invalidatesTags: [
                { type: 'Email', id: "LIST" }
            ]
        })
    }),
})

export const {
    useAddNewEmailMutation
} = emailsApiSlice
