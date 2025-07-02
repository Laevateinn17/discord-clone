import { AutoMap } from "@automapper/classes"

export class Payload<T> {

    @AutoMap()
    userId: string | string[]

    @AutoMap()
    data: T
}