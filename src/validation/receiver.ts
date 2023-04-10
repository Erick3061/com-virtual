import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, ValidateNested } from "class-validator";

export class ReceiverData{

    @ValidateNested()
    @Type(() => COM)
    public com!: COM;

    @IsString()
    public ack!: string;
    
    @IsInt()
    public attempt!: number;
    
    @IsString()
    public delimiter!: string;
    
    @IsString()
    public heartbeat!: string;
    
    @IsInt()
    public intervalAck!: number;
    
    @IsInt()
    public intervalHeart!: number;
    
    @IsBoolean()
    public isServerSender!: boolean;
    
    @IsInt()
    public status!: number;

}

class COM{
    @IsInt()
    public baudRate!: number;

    @IsString()
    public path!: string;

    @IsIn([5,6,7,8])
    @IsOptional()
    public databits?: number;

    @IsInt()
    @IsOptional()
    public highWaterMark?: number;

    @IsIn(["none", "even", "odd", "mark", "space"])
    @IsOptional()
    public parity?: string;

    @IsBoolean()
    @IsOptional()
    public rtscts?: boolean;

    @IsIn(["handshake", "enable", "toggle"])
    @IsOptional()
    public rtsMode?: string;

    @IsIn([1,2,1.5])
    public stopBits?: number;


}