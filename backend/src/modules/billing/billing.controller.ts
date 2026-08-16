import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('tenants/:tenantId/subscription')
  @RequirePermissions('billing.read')
  getCurrentSubscription(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.billingService.getCurrentSubscription(tenantId);
  }

  @Post('tenants/:tenantId/subscription/change-plan')
  @RequirePermissions('billing.write')
  changePlan(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: ChangePlanDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.billingService.changePlan(tenantId, dto, actor);
  }

  @Post('tenants/:tenantId/subscription/cancel')
  @RequirePermissions('billing.write')
  cancelSubscription(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.billingService.cancelSubscription(tenantId, actor);
  }

  @Get('tenants/:tenantId/plan-history')
  @RequirePermissions('billing.read')
  getPlanHistory(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.billingService.getPlanHistory(tenantId);
  }

  @Get('invoices')
  @RequirePermissions('billing.read')
  listInvoices(@Query() query: PaginationQueryDto & { tenantId?: string }) {
    return this.billingService.listInvoices(query);
  }

  @Get('invoices/:id')
  @RequirePermissions('billing.read')
  getInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.getInvoice(id);
  }

  @Post('invoices')
  @RequirePermissions('billing.write')
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.billingService.createInvoice(dto);
  }

  @Patch('invoices/:id/mark-paid')
  @RequirePermissions('billing.write')
  markPaid(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.markPaid(id);
  }

  @Patch('invoices/:id/mark-overdue')
  @RequirePermissions('billing.write')
  markOverdue(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.markOverdue(id);
  }
}
