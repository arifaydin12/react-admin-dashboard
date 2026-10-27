import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  growth?: number;
  className?: string;
}

const StatCard = ({ title, value, precision = 0, prefix = '', suffix = '', growth, className }: StatCardProps) => {
  return (
    <Card className={className}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        prefix={prefix}
        suffix={suffix}
      />
      {growth !== undefined && (
        <Statistic
          value={growth}
          precision={1}
          valueStyle={{ color: growth >= 0 ? '#3f8600' : '#cf1322' }}
          prefix={growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          suffix="%"
        />
      )}
    </Card>
  );
};

export default StatCard;