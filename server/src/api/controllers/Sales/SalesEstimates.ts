import { Router, Request, Response, NextFunction } from 'express';
import { check, param, query, matchedData } from 'express-validator';
import { Inject, Service } from 'typedi';
import { ISaleEstimate, ISaleEstimateOTD } from 'interfaces';
import BaseController from 'api/controllers/BaseController'
import asyncMiddleware from 'api/middleware/asyncMiddleware';
import SaleEstimateService from 'services/Sales/SalesEstimate';
import ItemsService from 'services/Items/ItemsService';

@Service()
export default class SalesEstimatesController extends BaseController {
  @Inject()
  saleEstimateService: SaleEstimateService;

  @Inject()
  itemsService: ItemsService;

  /**
   * Router constructor.
   */
  router() {
    const router = Router();

    router.post(
      '/',
      this.estimateValidationSchema,
      this.validationResult,
      // asyncMiddleware(this.validateEstimateCustomerExistance.bind(this)),
      // asyncMiddleware(this.validateEstimateNumberExistance.bind(this)),
      // asyncMiddleware(this.validateEstimateEntriesItemsExistance.bind(this)),
      asyncMiddleware(this.newEstimate.bind(this))
    );
    router.post(
      '/:id', [
        ...this.validateSpecificEstimateSchema,
        ...this.estimateValidationSchema,
      ],
      this.validationResult,
      // asyncMiddleware(this.validateEstimateIdExistance.bind(this)),
      // asyncMiddleware(this.validateEstimateCustomerExistance.bind(this)),
      // asyncMiddleware(this.validateEstimateNumberExistance.bind(this)),
      // asyncMiddleware(this.validateEstimateEntriesItemsExistance.bind(this)),
      // asyncMiddleware(this.valdiateInvoiceEntriesIdsExistance.bind(this)),
      asyncMiddleware(this.editEstimate.bind(this))
    );
    router.delete(
      '/:id', [
        this.validateSpecificEstimateSchema,
      ],
      this.validationResult,
      // asyncMiddleware(this.validateEstimateIdExistance.bind(this)),
      asyncMiddleware(this.deleteEstimate.bind(this))
    );
    router.get(
      '/:id',
      this.validateSpecificEstimateSchema,
      this.validationResult,
      // asyncMiddleware(this.validateEstimateIdExistance.bind(this)),
      asyncMiddleware(this.getEstimate.bind(this))
    );
    router.get(
      '/',
      this.validateEstimateListSchema,
      this.validationResult,
      asyncMiddleware(this.getEstimates.bind(this))
    );
    return router;
  }

  /**
   * Estimate validation schema.
   */
  get estimateValidationSchema() {
    return [
      check('customer_id').exists().isNumeric().toInt(),
      check('estimate_date').exists().isISO8601(),
      check('expiration_date').optional().isISO8601(),
      check('reference').optional(),
      check('estimate_number').exists().trim().escape(),

      check('entries').exists().isArray({ min: 1 }),
      check('entries.*.index').exists().isNumeric().toInt(),
      check('entries.*.item_id').exists().isNumeric().toInt(),
      check('entries.*.description').optional().trim().escape(),
      check('entries.*.quantity').exists().isNumeric().toInt(),
      check('entries.*.rate').exists().isNumeric().toFloat(),
      check('entries.*.discount').optional().isNumeric().toFloat(),

      check('note').optional().trim().escape(),
      check('terms_conditions').optional().trim().escape(),
    ];
  }

  /**
   * Specific sale estimate validation schema.
   */
  get validateSpecificEstimateSchema() {
    return [
      param('id').exists().isNumeric().toInt(),
    ];
  }

  /**
   * Sales estimates list validation schema.
   */
  get validateEstimateListSchema() {
    return [
      query('custom_view_id').optional().isNumeric().toInt(),
      query('stringified_filter_roles').optional().isJSON(),
      query('column_sort_by').optional(),
      query('sort_order').optional().isIn(['desc', 'asc']),
      query('page').optional().isNumeric().toInt(),
      query('page_size').optional().isNumeric().toInt(), 
    ]
  }

  /**
   * Handle create a new estimate with associated entries.
   * @param {Request} req -
   * @param {Response} res -
   * @return {Response} res -
   */
  async newEstimate(req: Request, res: Response) {
    const { tenantId } = req;
    const estimateOTD: ISaleEstimateOTD = matchedData(req, {
      locations: ['body'],
      includeOptionals: true,
    });
    const storedEstimate = await this.saleEstimateService
      .createEstimate(tenantId, estimateOTD);

    return res.status(200).send({ id: storedEstimate.id });
  }

  /**
   * Handle update estimate details with associated entries.
   * @param {Request} req 
   * @param {Response} res 
   */
  async editEstimate(req: Request, res: Response) {
    const { id: estimateId } = req.params;
    const { tenantId } = req;

    const estimateOTD: ISaleEstimateOTD = matchedData(req, {
      locations: ['body'],
      includeOptionals: true,
    });
    // Update estimate with associated estimate entries.
    await this.saleEstimateService.editEstimate(tenantId, estimateId, estimateOTD);

    return res.status(200).send({ id: estimateId });
  }

  /**
   * Deletes the given estimate with associated entries.
   * @param {Request} req 
   * @param {Response} res 
   */
  async deleteEstimate(req: Request, res: Response) {
    const { id: estimateId } = req.params;
    const { tenantId } = req;

    await this.saleEstimateService.deleteEstimate(tenantId, estimateId);

    return res.status(200).send({ id: estimateId });  
  }

  /**
   * Retrieve the given estimate with associated entries.
   */
  async getEstimate(req: Request, res: Response) {
    const { id: estimateId } = req.params;
    const { tenantId } = req;

    const estimate = await this.saleEstimateService
      .getEstimateWithEntries(tenantId, estimateId);

    return res.status(200).send({ estimate });
  }

  /**
   * Retrieve estimates with pagination metadata.
   * @param {Request} req 
   * @param {Response} res 
   */
  async getEstimates(req: Request, res: Response, next: NextFunction) {
    const { tenantId } = req;
    const estimatesFilter: ISalesEstimatesFilter = this.matchedQueryData(req);

    try {
      const { salesEstimates, pagination, filterMeta } = await this.saleEstimateService
        .estimatesList(tenantId, estimatesFilter);
      
      return res.status(200).send({
        sales_estimates: this.transfromToResponse(salesEstimates),
        pagination,
        filter_meta: this.transfromToResponse(filterMeta),
      })
    } catch (error) {
      next(error);
    }
  }
};
