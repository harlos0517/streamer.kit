export class ServiceRegistry {
  private services = new Map<string, unknown>()

  register(name: string, implementation: unknown): void {
    this.services.set(name, implementation)
  }

  get<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) throw new Error(`Service not found: ${name}`)
    return service as T
  }
}
