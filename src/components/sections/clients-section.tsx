export function ClientsSection() {
    return (
      <section className="bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              150+ reviews from over 2,500+ global satisfied clients
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              {['Stripe', 'Google', 'Spotify', 'Pinterest', 'Netflix'].map((client) => (
                <span key={client} className="text-2xl font-semibold text-muted-foreground/60">
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  