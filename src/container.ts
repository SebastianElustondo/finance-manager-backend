// Repository implementations
import { PortfolioRepository } from './modules/portfolio/repository'
import { AssetRepository } from './modules/asset/repository'
import { AlertRepository } from './modules/alert/repository'

// Service implementations
import { PortfolioService } from './modules/portfolio/service'
import { AssetService } from './modules/asset/service'
import { AlertService } from './modules/alert/service'

// Controller implementations
import { PortfolioController } from './modules/portfolio/controller'
import { AssetController } from './modules/asset/controller'
import { AlertController } from './modules/alert/controller'

export class Container {
  // Repositories
  private portfolioRepository: PortfolioRepository
  private assetRepository: AssetRepository
  private alertRepository: AlertRepository

  // Services
  private portfolioService: PortfolioService
  private assetService: AssetService
  private alertService: AlertService

  // Controllers
  private portfolioController: PortfolioController
  private assetController: AssetController
  private alertController: AlertController

  constructor() {
    // Initialize repositories
    this.portfolioRepository = new PortfolioRepository()
    this.assetRepository = new AssetRepository()
    this.alertRepository = new AlertRepository()

    // Initialize services with their dependencies
    this.portfolioService = new PortfolioService(this.portfolioRepository)
    this.assetService = new AssetService(this.assetRepository, this.portfolioRepository)
    this.alertService = new AlertService(this.alertRepository)

    // Initialize controllers with their dependencies
    this.portfolioController = new PortfolioController(this.portfolioService)
    this.assetController = new AssetController(this.assetService)
    this.alertController = new AlertController(this.alertService)
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
}

// Create and export a single instance
export const container = new Container() 