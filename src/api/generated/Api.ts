/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface OrbitType {
  id: number;
  name: string;
  description: string | null;
  height: number | null;
  inclination: number | null;
  image: string;
  video: string;
  status: string;
  creatorId: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  formedAt: string | null;
  isCreator: 0 | 1;
  likeCount: number;
  isLiked: 0 | 1;
}

export interface GetPublishedListParams {
  /**
   * @min 0
   * @max 40000
   */
  maxHeight?: number;
}

export type GetPublishedListData = OrbitType[];

export interface CreateDraftPayload {
  name: string;
  /** @format binary */
  image?: File;
  /** @format binary */
  video?: File;
}

export type CreateDraftData = OrbitType;

export interface GetFeedParams {
  id?: number;
  next?: boolean;
}

export type GetFeedData = OrbitType;

export type GetDraftData = OrbitType;

export interface PublishDraftPayload {
  description?: string | null;
  height?: number | null;
  inclination?: number | null;
}

export type PublishDraftData = OrbitType;

export interface DeletePublishedParams {
  id: number;
}

export interface DeletePublishedData {
  id?: number;
  status?: string;
}

export interface SetLikePayload {
  liked: 0 | 1;
}

export interface SetLikeParams {
  id: number;
}

export interface SetLikeData {
  id?: number;
  liked?: 0 | 1;
  likeCount?: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "/",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Orbit Calculator API
 * @version 1.0
 * @baseUrl /
 * @contact
 *
 * API типов орбит. GET-методы списка и ленты доступны без входа. Для методов создателя используйте HttpOnly cookie sessionId, которую устанавливает /api/orbit-users/authentication.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Типы орбит
     * @name GetPublishedList
     * @summary Получить опубликованные типы орбит с фильтром по высоте
     * @request GET:/api/orbit-types
     */
    getPublishedList: (
      query: GetPublishedListParams = {},
      params: RequestParams = {},
    ) =>
      this.request<GetPublishedListData, any>({
        path: `/api/orbit-types`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Типы орбит
     * @name CreateDraft
     * @summary Создать черновик орбиты и загрузить изображение и видео
     * @request POST:/api/orbit-types
     * @secure
     */
    createDraft: (data: CreateDraftPayload, params: RequestParams = {}) =>
      this.request<CreateDraftData, any>({
        path: `/api/orbit-types`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Типы орбит
     * @name GetFeed
     * @summary Получить одну опубликованную орбиту или следующую за указанной
     * @request GET:/api/orbit-types/feed
     */
    getFeed: (query: GetFeedParams = {}, params: RequestParams = {}) =>
      this.request<GetFeedData, any>({
        path: `/api/orbit-types/feed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Типы орбит
     * @name GetDraft
     * @summary Получить черновик текущего пользователя
     * @request GET:/api/orbit-types/draft
     * @secure
     */
    getDraft: (params: RequestParams = {}) =>
      this.request<GetDraftData, any>({
        path: `/api/orbit-types/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Типы орбит
     * @name PublishDraft
     * @summary Опубликовать черновик текущего пользователя
     * @request PUT:/api/orbit-types/draft/publish
     * @secure
     */
    publishDraft: (data: PublishDraftPayload, params: RequestParams = {}) =>
      this.request<PublishDraftData, any>({
        path: `/api/orbit-types/draft/publish`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Типы орбит
     * @name DeletePublished
     * @summary Логически удалить опубликованную орбиту текущего пользователя
     * @request DELETE:/api/orbit-types/{id}
     * @secure
     */
    deletePublished: (
      { id }: DeletePublishedParams,
      params: RequestParams = {},
    ) =>
      this.request<DeletePublishedData, any>({
        path: `/api/orbit-types/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Типы орбит
     * @name SetLike
     * @summary Поставить или снять лайк с опубликованной орбиты
     * @request POST:/api/orbit-types/{id}/like
     * @secure
     */
    setLike: (
      { id }: SetLikeParams,
      data: SetLikePayload,
      params: RequestParams = {},
    ) =>
      this.request<SetLikeData, any>({
        path: `/api/orbit-types/${id}/like`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
