/**
 * Backend
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface OrderDto { 
    id: number;
    status: string;
    customerName: string;
    createdBySD: string;
    createdByCS: string;
    canceled: boolean;
    successfullyFinished: boolean;
    additionalInformation: string;
    lastUpdated: string;
    createdOn: string;
    finishedOn: string;
    checklistId: number;
    sped: string;
    country: string;
    readyToLoad: string;
    abNumber: number;
    csid: number;
    tlid: number;
    ppId: number;
}

