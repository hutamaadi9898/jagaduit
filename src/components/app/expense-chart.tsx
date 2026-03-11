import { motion } from "framer-motion";

type ExpenseChartProps = {
  data: Array<{
    date: string;
    totalExpense: number;
  }>;
};

export function ExpenseChart({ data }: ExpenseChartProps) {
  const maxValue = Math.max(...data.map((item) => item.totalExpense), 1);

  return (
    <div className="space-y-4">
      <div className="chart-panel relative flex h-48 items-end gap-2 overflow-hidden rounded-[1.8rem] px-3 pb-3 pt-5">
        <div className="pointer-events-none absolute inset-x-3 top-6 border-t border-dashed border-primary/15" />
        <div className="pointer-events-none absolute inset-x-3 top-1/2 border-t border-dashed border-primary/15" />
        <div className="pointer-events-none absolute inset-x-3 bottom-12 border-t border-dashed border-primary/15" />
        {data.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center rounded-[1.6rem] bg-muted text-sm text-muted-foreground">
            Belum ada pengeluaran bulan ini.
          </div>
        ) : (
          data.map((item, index) => (
            <div key={item.date} className="relative z-10 flex flex-1 flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: `${Math.max((item.totalExpense / maxValue) * 100, 10)}%`,
                  opacity: 1
                }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="w-full rounded-full bg-[linear-gradient(180deg,rgba(177,140,248,0.36),rgba(140,101,241,1))]"
              />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {new Date(item.date).getDate()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
