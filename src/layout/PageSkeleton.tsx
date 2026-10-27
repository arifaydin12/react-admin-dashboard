import { Card, Col, Row, Skeleton } from 'antd'

/** Route-level fallback shown while a lazy page chunk is loading. */
export default function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading page">
      <Skeleton active title={{ width: 220 }} paragraph={{ rows: 1, width: 360 }} />
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col key={i} xs={24} sm={12} xl={6}>
            <Card>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
        <Col span={24}>
          <Card>
            <Skeleton.Node active style={{ width: '100%', height: 280 }}>
              {' '}
            </Skeleton.Node>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
