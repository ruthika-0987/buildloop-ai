import { describe, it, expect } from 'vitest';
import { evaluateMatch, buildCompositeMatch } from '../engine/matching';
import { Batch, Demand, Alert } from '../types';

describe('Listings, Demand Board & Alerts (M5)', () => {
  const sampleDemand: Demand = {
    id: 'dem-test-01',
    title: 'Need 10,000 Bricks for Boundary Wall',
    materialType: 'Clay Bricks',
    materialSubtype: 'Hand-moulded Red Clay Bricks',
    intendedUse: 'Non-loadbearing boundary wall',
    quantityNeeded: 10000,
    unit: 'Pieces',
    maxBudgetPerUnit: 7.0,
    requiredTrustLevel: 'L2',
    deliveryLocation: {
      address: 'Prakash Nagar, Begumpet, Hyderabad',
      lat: 17.4447,
      lng: 78.4664
    },
    neededFrom: '2026-10-15',
    neededUntil: '2026-11-20',
    buyerId: 'buyer-001',
    buyerName: 'Urban Habitat Builders',
    status: 'open',
    created_at: '2026-10-14T00:00:00Z'
  };

  const sampleBatch: Batch = {
    id: 'bat-test-01',
    title: 'Salvaged Clay Bricks (Jubilee Hills)',
    materialType: 'Clay Bricks',
    materialSubtype: 'Hand-moulded Red Clay Bricks',
    quantity: 12000,
    unit: 'Pieces',
    pricePerUnit: 4.5,
    originalNewPrice: 10.0,
    condition: 'Intact',
    lawfulDeclarationAccepted: true,
    location: {
      address: 'Road No. 36, Jubilee Hills, Hyderabad',
      lat: 17.4319,
      lng: 78.4073
    },
    availableFrom: '2026-10-15',
    availableUntil: '2026-11-30',
    readinessScore: 88,
    trustLevel: 'L2',
    sellerId: 'seller-001',
    sellerName: 'Deccan Salvage',
    photos: ['brick.jpg'],
    documents: [{ name: 'Test.pdf', type: 'Lab', verified: true, date: '2026-10-10' }],
    status: 'published',
    created_at: '2026-10-14T00:00:00Z'
  };

  it('Matches demand with published batch and scores in Strong band', () => {
    const match = evaluateMatch(sampleBatch, sampleDemand);
    expect(match.passedHardFilters).toBe(true);
    expect(match.totalScore).toBeGreaterThanOrEqual(80);
    expect(match.band).toBe('Strong');
  });

  it('Generates an alert when match score is >= 80', () => {
    const match = evaluateMatch(sampleBatch, sampleDemand);
    let generatedAlert: Alert | null = null;

    if (match.passedHardFilters && match.totalScore >= 80) {
      generatedAlert = {
        id: 'alt-001',
        userId: sampleDemand.buyerId,
        type: 'match_found',
        title: `A new batch matches your demand: ${match.totalScore}/100`,
        body: `${sampleBatch.title} matches "${sampleDemand.title}" (${match.band} band).`,
        link: `#/batches/${sampleBatch.id}`,
        read: false,
        created_at: new Date().toISOString()
      };
    }

    expect(generatedAlert).not.toBeNull();
    expect(generatedAlert?.userId).toBe('buyer-001');
    expect(generatedAlert?.title).toContain('A new batch matches your demand');
  });

  it('Builds a composite match when demand exceeds a single batch quantity', () => {
    const smallBatch1: Batch = {
      ...sampleBatch,
      id: 'bat-small-01',
      quantity: 6000
    };
    const smallBatch2: Batch = {
      ...sampleBatch,
      id: 'bat-small-02',
      quantity: 5000,
      location: {
        address: 'Gachibowli Site',
        lat: 17.4401,
        lng: 78.3489
      }
    };

    const composite = buildCompositeMatch([smallBatch1, smallBatch2], sampleDemand);
    expect(composite).not.toBeNull();
    expect(composite?.totalAllocated).toBe(10000);
    expect(composite?.sources.length).toBe(2);
    expect(composite?.penalty).toBe(3); // -3 for 1 extra source
  });
});
