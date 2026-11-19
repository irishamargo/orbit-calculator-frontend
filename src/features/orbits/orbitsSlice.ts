import axios from "axios";
import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { orbitApi } from "../../api/client";
import { mockOrbits } from "./mockOrbits";
import { fromApiOrbit, type Orbit } from "./types";

type ThunkConfig = { state: RootState; rejectValue: string };
type CreateDraftInput = { name: string; image?: File; video?: File };
type PublishDraftInput = {
  description: string | null;
  height: number | null;
  inclination: number | null;
};
type FeedInput = { id?: number; next?: boolean };

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return error instanceof Error ? error.message : "Не удалось выполнить запрос.";
}

function isOffline(error: unknown) {
  if (!axios.isAxiosError(error) || !error.response) return true;
  return [502, 503, 504].includes(error.response.status);
}

export const fetchOrbits = createAsyncThunk<
  { items: Orbit[]; source: "api" | "mock" },
  number,
  ThunkConfig
>(
  "orbits/fetchList",
  async (maxHeight, { getState, rejectWithValue }) => {
    try {
      const response = await orbitApi.api.getPublishedList({ maxHeight });
      return { items: response.data.map(fromApiOrbit), source: "api" };
    } catch (error) {
      if (!getState().auth.user && isOffline(error)) {
        return {
          items: mockOrbits.filter(
            (orbit) => orbit.height === null || orbit.height <= maxHeight,
          ),
          source: "mock",
        };
      }
      return rejectWithValue(errorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().orbits.requests.fetchList,
  },
);

export const fetchFeedOrbit = createAsyncThunk<Orbit | null, FeedInput, ThunkConfig>(
  "orbits/fetchFeed",
  async (input, { getState, rejectWithValue }) => {
    try {
      const response = await orbitApi.api.getFeed({
        id: input.id,
        next: input.next,
      });
      return fromApiOrbit(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      if (!getState().auth.user && isOffline(error)) {
        const source = [...mockOrbits].sort((a, b) => a.id - b.id);
        const index = input.id
          ? Math.max(0, source.findIndex((orbit) => orbit.id === input.id))
          : -1;
        const fallback = input.next
          ? source[(index + 1) % source.length]
          : source[Math.max(0, index)];
        return fallback;
      }
      return rejectWithValue(errorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().orbits.requests.fetchFeed,
  },
);

export const fetchDraft = createAsyncThunk<Orbit | null, void, ThunkConfig>(
  "orbits/fetchDraft",
  async (_, { rejectWithValue }) => {
    try {
      const response = await orbitApi.api.getDraft();
      return fromApiOrbit(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      return rejectWithValue(errorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().orbits.requests.fetchDraft,
  },
);

export const createDraft = createAsyncThunk<Orbit, CreateDraftInput, ThunkConfig>(
  "orbits/createDraft",
  async (input, { rejectWithValue }) => {
    try {
      const payload: { name: string; image?: File; video?: File } = {
        name: input.name,
      };
      if (input.image) payload.image = input.image;
      if (input.video) payload.video = input.video;
      const response = await orbitApi.api.createDraft(payload);
      return fromApiOrbit(response.data);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const publishDraft = createAsyncThunk<Orbit, PublishDraftInput, ThunkConfig>(
  "orbits/publishDraft",
  async (input, { rejectWithValue }) => {
    try {
      const response = await orbitApi.api.publishDraft(input);
      return fromApiOrbit(response.data);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const deleteOrbit = createAsyncThunk<number, number, ThunkConfig>(
  "orbits/deleteOrbit",
  async (id, { rejectWithValue }) => {
    try {
      await orbitApi.api.deletePublished({ id });
      return id;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const setOrbitLike = createAsyncThunk<
  { id: number; liked: boolean; likeCount: number },
  { id: number; liked: boolean },
  ThunkConfig
>("orbits/setLike", async ({ id, liked }, { rejectWithValue }) => {
  try {
    const response = await orbitApi.api.setLike(
      { id },
      { liked: liked ? 1 : 0 },
    );
    return {
      id,
      liked,
      likeCount: response.data.likeCount ?? 0,
    };
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

type OrbitsState = {
  items: Orbit[];
  feed: Orbit | null;
  draft: Orbit | null;
  maxHeight: number;
  appliedMaxHeight: number;
  loading: number;
  requests: Record<string, boolean>;
  error: string | null;
  dataSource: "api" | "mock";
};

const initialState: OrbitsState = {
  items: [],
  feed: null,
  draft: null,
  maxHeight: 40000,
  appliedMaxHeight: 40000,
  loading: 0,
  requests: {},
  error: null,
  dataSource: "api",
};

const allPending = [
  fetchOrbits.pending,
  fetchFeedOrbit.pending,
  fetchDraft.pending,
  createDraft.pending,
  publishDraft.pending,
  deleteOrbit.pending,
  setOrbitLike.pending,
];
const allFinished = [
  fetchOrbits.fulfilled,
  fetchOrbits.rejected,
  fetchFeedOrbit.fulfilled,
  fetchFeedOrbit.rejected,
  fetchDraft.fulfilled,
  fetchDraft.rejected,
  createDraft.fulfilled,
  createDraft.rejected,
  publishDraft.fulfilled,
  publishDraft.rejected,
  deleteOrbit.fulfilled,
  deleteOrbit.rejected,
  setOrbitLike.fulfilled,
  setOrbitLike.rejected,
];
const allRejected = [
  fetchOrbits.rejected,
  fetchFeedOrbit.rejected,
  fetchDraft.rejected,
  createDraft.rejected,
  publishDraft.rejected,
  deleteOrbit.rejected,
  setOrbitLike.rejected,
];

const orbitsSlice = createSlice({
  name: "orbits",
  initialState,
  reducers: {
    setMaxHeight(state, action: { payload: number }) {
      state.maxHeight = action.payload;
    },
    applyMaxHeight(state, action: { payload: number }) {
      state.maxHeight = action.payload;
      state.appliedMaxHeight = action.payload;
    },
    clearOrbitError(state) {
      state.error = null;
    },
    clearFeed(state) {
      state.feed = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrbits.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.dataSource = action.payload.source;
      })
      .addCase(fetchFeedOrbit.fulfilled, (state, action) => {
        state.feed = action.payload;
      })
      .addCase(fetchDraft.fulfilled, (state, action) => {
        state.draft = action.payload;
      })
      .addCase(createDraft.fulfilled, (state, action) => {
        state.draft = action.payload;
      })
      .addCase(publishDraft.fulfilled, (state, action) => {
        state.draft = null;
        state.items = state.items.filter(
          (orbit) =>
            orbit.id !== action.payload.id &&
            (orbit.height === null ||
              orbit.height <= state.appliedMaxHeight),
        );
        if (
          action.payload.height === null ||
          action.payload.height <= state.appliedMaxHeight
        ) {
          state.items.push(action.payload);
          state.items.sort((a, b) => a.id - b.id);
        }
        state.feed = action.payload;
      })
      .addCase(deleteOrbit.fulfilled, (state, action) => {
        state.items = state.items.filter((orbit) => orbit.id !== action.payload);
        if (state.feed?.id === action.payload) state.feed = null;
      })
      .addCase(setOrbitLike.fulfilled, (state, action) => {
        const { id, liked, likeCount } = action.payload;
        state.items = state.items.map((orbit) =>
          orbit.id === id ? { ...orbit, isLiked: liked, likeCount } : orbit,
        );
        if (state.feed?.id === id) {
          state.feed = { ...state.feed, isLiked: liked, likeCount };
        }
      })
      .addMatcher(isAnyOf(...allPending), (state, action) => {
        state.loading += 1;
        state.error = null;
        state.requests[action.type.split("/")[1]] = true;
      })
      .addMatcher(isAnyOf(...allFinished), (state, action) => {
        state.loading = Math.max(0, state.loading - 1);
        state.requests[action.type.split("/")[1]] = false;
      })
      .addMatcher(
        isAnyOf(...allRejected),
        (state, action) => {
          if ("payload" in action && typeof action.payload === "string") {
            state.error = action.payload;
          }
        },
      );
  },
});

export const { applyMaxHeight, clearFeed, clearOrbitError, setMaxHeight } =
  orbitsSlice.actions;
export default orbitsSlice.reducer;
