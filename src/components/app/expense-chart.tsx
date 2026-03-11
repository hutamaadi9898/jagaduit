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
      <div className="flex h-48 items-end gap-2">
        {data.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center rounded-[1.6rem] bg-muted text-sm text-muted-foreground">
            Belum ada pengeluaran bulan ini.
          </div>
        ) : (
          data.map((item, index) => (
            <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: `${Math.max((item.totalExpense / maxValue) * 100, 10)}%`,
                  opacity: 1
                }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="w-full rounded-t-[1rem] bg-gradient-to-t from-primary via-primary/80 to-secondary"
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
