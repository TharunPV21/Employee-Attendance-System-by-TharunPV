import { createSlice } from '@reduxjs/toolkit';

const tharunReadUser = () => {
  try {
    const u = localStorage.getItem('tharun_att_user');
    const t = localStorage.getItem('tharun_att_token');
    if (u && t) return { user: JSON.parse(u), token: t };
  } catch (_) {}
  return { user: null, token: null };
};

const { user: initUser, token: initToken } = tharunReadUser();

const initialState = {
  user: initUser,
  token: initToken,
  loading: false,
  error: null,
};

const tharunAuthSlice = createSlice({
  name: 'tharunAuth',
  initialState,
  reducers: {
    tharunSetCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      if (action.payload.token) {
        localStorage.setItem('tharun_att_token', action.payload.token);
        localStorage.setItem('tharun_att_user', JSON.stringify(action.payload.user));
      }
    },
    tharunLogout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('tharun_att_token');
      localStorage.removeItem('tharun_att_user');
    },
    tharunSetLoading: (state, action) => {
      state.loading = action.payload;
    },
    tharunSetError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { tharunSetCredentials, tharunLogout, tharunSetLoading, tharunSetError } = tharunAuthSlice.actions;
export default tharunAuthSlice.reducer;
