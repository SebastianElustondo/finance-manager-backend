// Repository implementations
import { PortfolioRepository } from './repositories/PortfolioRepository'
import { AssetRepository } from './repositories/AssetRepository'
import { AlertRepository } from './repositories/AlertRepository'
import { PriceRepository } from './repositories/PriceRepository'

// Service implementations
import { PortfolioService } from './services/PortfolioService'
import { AssetService } from './services/AssetService'
import { AlertService } from './services/AlertService'
import { PriceService } from './services/PriceService'

// Controller implementations
import { PortfolioController } from './controllers/PortfolioController'
import { AssetController } from './controllers/AssetController'
import { AlertController } from './controllers/AlertController'
import { PriceController } from './controllers/PriceController'

export class Container {
  // Repositories
  private portfolioRepository: PortfolioRepository
  private assetRepository: AssetRepository
  private alertRepository: AlertRepository
  private priceRepository: PriceRepository

  // Services
  private portfolioService: PortfolioService
  private assetService: AssetService
  private alertService: AlertService
  private priceService: PriceService

  // Controllers
  private portfolioController: PortfolioController
  private assetController: AssetController
  private alertController: AlertController
  private priceController: PriceController

  constructor() {
    // Initialize repositories
    this.portfolioRepository = new PortfolioRepository()
    this.assetRepository = new AssetRepository()
    this.alertRepository = new AlertRepository()
    this.priceRepository = new PriceRepository()

    // Initialize services with their dependencies
    this.portfolioService = new PortfolioService(this.portfolioRepository)
    this.assetService = new AssetService(this.assetRepository, this.portfolioRepository)
    this.alertService = new AlertService(this.alertRepository)
    this.priceService = new PriceService(this.priceRepository, this.alertService)

    // Initialize controllers with their dependencies
    this.portfolioController = new PortfolioController(this.portfolioService)
    this.assetController = new AssetController(this.assetService)
    this.alertController = new AlertController(this.alertService)
    this.priceController = new PriceController(this.priceService)
  }

  // Getters for controllers (used by routes)
  getPortfolioController(): PortfolioController {
    return this.portfolioController
  }

  getAssetController(): AssetController {
    return this.assetController
  }

  getAlertController(): AlertController {
    return this.alertController
  }

  getPriceController(): PriceController {
    return this.priceController
  }

  // Getters for services (if needed elsewhere)
  getPortfolioService(): PortfolioService {
    return this.portfolioService
  }

  getAssetService(): AssetService {
    return this.assetService
  }

  getAlertService(): AlertService {
    return this.alertService
  }

  getPriceService(): PriceService {
    return this.priceService
  }
}

// Create and export a single instance
export const container = new Container() 