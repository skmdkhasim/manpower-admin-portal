import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSuperAdminDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsUUID()
  roleId: string;
}
