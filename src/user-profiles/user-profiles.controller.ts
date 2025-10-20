import { Body, Controller, ValidationPipe } from '@nestjs/common';
import { MessagePattern } from "@nestjs/microservices";
import { USER_PROFILE_UPDATE_EVENT } from "src/constants/events";
import { UserStatusUpdateDTO } from "./dto/user-status-update.dto";
import { Payload } from "src/interfaces/payload.dto";
import { WsGateway } from "src/ws/ws.gateway";
import { UserProfileResponseDTO } from "./dto/user-profile-response.dto";

@Controller('user-profiles')
export class UserProfilesController {

    constructor(
        private readonly gateway: WsGateway
    ) {
    }


    @MessagePattern(USER_PROFILE_UPDATE_EVENT)
    async handleFriendAdded(@Body(new ValidationPipe({ transform: true })) dto: Payload<UserProfileResponseDTO>) {
        this.gateway.handleUserProfileUpdate(dto);
    }
}
