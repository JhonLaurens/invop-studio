export type ReferenceTopic = "Transporte" | "Colas" | "Ambas";

export type ReferenceItem = {
  id: string;
  topic: ReferenceTopic;
  citation: string;
  linkLabel: string;
  usedFor: string;
  href: string;
};

/** Enlaces comprobados en noviembre de 2026. El DOI resuelve a la ficha editorial. */
export const REFERENCES: ReferenceItem[] = [
  {
    id: "hitchcock-1941",
    topic: "Transporte",
    citation:
      "Hitchcock, F. L. (1941). The distribution of a product from several sources to numerous localities. Journal of Mathematics and Physics, 20(1–4), 224–230.",
    linkLabel: "Hitchcock (1941)",
    usedFor: "Planteamiento clásico del problema de transporte: minimizar el costo de enviar oferta desde varios orígenes hasta cubrir la demanda.",
    href: "https://onlinelibrary.wiley.com/doi/10.1002/sapm1941201224",
  },
  {
    id: "hillier-2024",
    topic: "Ambas",
    citation:
      "Hillier, F. S. y Lieberman, G. J. (2024). Introduction to Operations Research. McGraw-Hill. Capítulos 9 (transporte) y 17 (colas).",
    linkLabel: "Hillier y Lieberman (2024)",
    usedFor:
      "Esquina noroeste, aproximación de Vogel, método símplex de transporte (potenciales u-v / MODI) y modelos M/M/s con costo de servicio frente a costo de espera.",
    href: "https://www.mheducation.co.uk/introduction-to-operations-research-2024-release-ise-9781266933226-emea-group",
  },
  {
    id: "mit-15053",
    topic: "Transporte",
    citation:
      "Orlin, J. (2013). Networks 2: Network flows. 15.053 Optimization Methods in Management Science. MIT OpenCourseWare.",
    linkLabel: "Orlin (2013)",
    usedFor: "El transporte como flujo de costo mínimo y el nodo ficticio cuando la oferta no coincide con la demanda.",
    href: "https://ocw.mit.edu/courses/15-053-optimization-methods-in-management-science-spring-2013/687225c151d8cc8254dcb8b07e5f9ce2_MIT15_053S13_lec16.pdf",
  },
  {
    id: "mit-15057",
    topic: "Transporte",
    citation:
      "Vande Vate, J. (2003). Network models: assignment and transportation. 15.057 Systems Optimization. MIT OpenCourseWare.",
    linkLabel: "Vande Vate (2003)",
    usedFor: "Modelo de asignación y de transporte, con hojas de cálculo del mismo curso para contrastar una solución.",
    href: "https://ocw.mit.edu/courses/15-057-systems-optimization-spring-2003/pages/lecture-notes/",
  },
  {
    id: "kendall-1953",
    topic: "Colas",
    citation:
      "Kendall, D. G. (1953). Stochastic processes occurring in the theory of queues and their analysis by the method of the imbedded Markov chain. The Annals of Mathematical Statistics, 24(4), 338–354.",
    linkLabel: "Kendall (1953)",
    usedFor: "Notación de un sistema con llegadas, servicio y varios servidores. M/M/1, M/M/2 y M/M/3 son los casos s = 1, 2 y 3.",
    href: "https://projecteuclid.org/journals/annals-of-mathematical-statistics/volume-24/issue-4/Stochastic-Processes-Occurring-in-the-Theory-of-Queues-and-their/10.1214/aoms/1177728975.full",
  },
  {
    id: "little-1961",
    topic: "Colas",
    citation:
      "Little, J. D. C. (1961). A proof for the queuing formula: L = λW. Operations Research, 9(3), 383–387.",
    linkLabel: "Little (1961)",
    usedFor: "Ley de Little: el número medio en el sistema es la tasa de llegadas por el tiempo medio en el sistema. El aplicativo la usa como relación entre L, λ y W.",
    href: "https://pubsonline.informs.org/doi/10.1287/opre.9.3.383",
  },
  {
    id: "gross-2008",
    topic: "Colas",
    citation:
      "Gross, D., Shortle, J. F., Thompson, J. M. y Harris, C. M. (2008). Fundamentals of Queueing Theory (4.ª ed.). Wiley.",
    linkLabel: "Gross et al. (2008)",
    usedFor: "Fórmulas de P0, Lq, L, Wq, W y Pw del modelo M/M/s, y la condición de estabilidad ρ < 1.",
    href: "https://onlinelibrary.wiley.com/doi/book/10.1002/9781118625651",
  },
];
