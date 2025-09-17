import { jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SocialShare } from '@/components/gamification/SocialShare'
import { BadgeShare } from '@/components/gamification/BadgeShare'

// Mock the window.open function
global.open = jest.fn()

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
})

// Mock the fetch API
global.fetch = jest.fn()

// Mock the canvas API
const mockCanvas = {
  getContext: jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    measureText: jest.fn().mockReturnValue({ width: 100 }),
  }),
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,_mock_image_data'),
}

HTMLCanvasElement.prototype.getContext = mockCanvas.getContext
HTMLCanvasElement.prototype.toDataURL = mockCanvas.toDataURL

describe('SocialShare Component', () => {
  const mockAchievement = {
    id: 'achievement-1',
    name: '测试成就',
    description: '这是一个测试成就',
    icon: '🏆',
    category: '测试',
    points: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockProps = {
    contentType: 'achievement',
    contentId: 'achievement-1',
    achievement: mockAchievement,
    isOpen: true,
    onClose: jest.fn(),
    userId: 'user-1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders SocialShare component correctly', () => {
    render(<SocialShare {...mockProps} />)

    expect(screen.getByText('社交分享')).toBeInTheDocument()
    expect(screen.getByText('成就')).toBeInTheDocument()
    expect(screen.getByText('徽章')).toBeInTheDocument()
    expect(screen.getByText('个人资料')).toBeInTheDocument()
    expect(screen.getByText('进度')).toBeInTheDocument()
    expect(screen.getByText('排行榜')).toBeInTheDocument()
  })

  test('closes when close button is clicked', () => {
    render(<SocialShare {...mockProps} />)

    const closeButton = screen.getByRole('button', { name: /关闭/i })
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })

  test('copies share text to clipboard', async () => {
    render(<SocialShare {...mockProps} />)

    const copyButton = screen.getByRole('button', { name: /复制链接/i })
    fireEvent.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  test('opens social media share dialogs', () => {
    render(<SocialShare {...mockProps} />)

    // Switch to social media tab
    const socialTab = screen.getByText('社交媒体')
    fireEvent.click(socialTab)

    // Click WeChat share button
    const wechatButton = screen.getByText('微信')
    fireEvent.click(wechatButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()

    // Click Twitter share button
    const twitterButton = screen.getByText('Twitter')
    fireEvent.click(twitterButton)

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank'
    )
  })

  test('generates share image', async () => {
    render(<SocialShare {...mockProps} />)

    // Switch to image tab
    const imageTab = screen.getByText('分享图片')
    fireEvent.click(imageTab)

    // Click generate image button
    const generateButton = screen.getByText('生成分享图片')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockCanvas.toDataURL).toHaveBeenCalled()
    })
  })

  test('submits share record to API', async () => {
    const mockResponse = {
      success: true,
      share: {
        id: 'share-1',
        userId: 'user-1',
        platform: 'wechat',
        contentType: 'achievement',
        contentId: 'achievement-1',
        shareText: '我刚刚解锁了成就「测试成就」！',
        shareImage: 'data:image/png;base64,_mock_image_data',
        createdAt: new Date().toISOString(),
      },
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    })

    render(<SocialShare {...mockProps} />)

    // Switch to history tab
    const historyTab = screen.getByText('分享历史')
    fireEvent.click(historyTab)

    // Wait for API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/gamification/social-share',
        expect.objectContaining({
          method: 'GET',
        })
      )
    })
  })
})

describe('BadgeShare Component', () => {
  const mockBadge = {
    id: 'badge-1',
    name: '测试徽章',
    description: '这是一个测试徽章',
    icon: '🏆',
    category: '测试',
    points: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockProps = {
    badge: mockBadge,
    isOpen: true,
    onClose: jest.fn(),
    userId: 'user-1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders BadgeShare component correctly', () => {
    render(<BadgeShare {...mockProps} />)

    expect(screen.getByText('分享徽章')).toBeInTheDocument()
    expect(screen.getByText('链接分享')).toBeInTheDocument()
    expect(screen.getByText('社交媒体')).toBeInTheDocument()
    expect(screen.getByText('二维码')).toBeInTheDocument()
  })

  test('closes when close button is clicked', () => {
    render(<BadgeShare {...mockProps} />)

    const closeButton = screen.getByRole('button', { name: /关闭/i })
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })

  test('opens SocialShare when advanced share button is clicked', () => {
    render(<BadgeShare {...mockProps} />)

    const advancedShareButton = screen.getByText('高级分享')
    fireEvent.click(advancedShareButton)

    expect(screen.getByText('社交分享')).toBeInTheDocument()
  })
})