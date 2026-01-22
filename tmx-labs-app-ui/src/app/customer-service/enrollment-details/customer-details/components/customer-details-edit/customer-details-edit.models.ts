import { Resource } from "src/app/shared/data/application/resources";
import { CustomerInfo } from "src/app/shared/data/participant/resources";

export interface UpdateCustomerRequest extends Resource {
    customer: CustomerInfo;
}