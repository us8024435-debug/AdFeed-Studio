/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApiError {
  message: string;
  errors?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
